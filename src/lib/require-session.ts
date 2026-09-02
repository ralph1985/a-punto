import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSessionRevoked, isValidSession, SESSION_COOKIE } from "./auth";

export async function requireSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value || !isValidSession(value) || await isSessionRevoked(value)) redirect("/login");
}
