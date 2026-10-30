import { NextResponse } from "next/server";

// Legacy bootstrap/reset endpoints are intentionally unavailable over HTTP.
export async function GET() {
  return NextResponse.json({ message: "Configuração via HTTP desativada. Use provisionamento local autorizado." }, { status: 410 });
}
