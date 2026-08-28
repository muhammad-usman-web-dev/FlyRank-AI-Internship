import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "orbit-one-3d-configurator",
    timestamp: new Date().toISOString(),
  });
}
