import { NextRequest, NextResponse } from "next/server";
import { validAuthToken } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("alumni_aiops_auth")?.value;
  return NextResponse.json({ authenticated: await validAuthToken(token) });
}
