"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyAccessCode } from "@/lib/access-code";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { clearLoginAttempts, getLoginClientIp, isLoginBlocked, recordFailedLogin } from "@/lib/login-rate-limit";

export type LoginState = { error?: string };

const loginSchema = z.object({
  code: z.string().trim().min(1, "Introduce el código de acceso."),
});

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const requestHeaders = await headers();
  const clientIp = getLoginClientIp(requestHeaders);
  if (await isLoginBlocked(clientIp)) return { error: "Demasiados intentos. Espera unos minutos." };

  const valid = await verifyAccessCode(parsed.data.code);
  if (!valid) {
    const blocked = await recordFailedLogin(clientIp);
    return { error: blocked ? "Demasiados intentos. Espera unos minutos." : "El código no es válido." };
  }

  await clearLoginAttempts(clientIp);

  const session = createSession();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.expiresAt - Math.floor(Date.now() / 1000),
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
