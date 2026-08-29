import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getVehiclesForNavigation } from "@/lib/vehicle-routes";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!isValidSession(session)) {
    return NextResponse.json({ error: "No autorizado." }, {
      status: 401,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const vehicles = await getVehiclesForNavigation();
  return NextResponse.json(vehicles, { headers: { "Cache-Control": "private, no-store" } });
}
