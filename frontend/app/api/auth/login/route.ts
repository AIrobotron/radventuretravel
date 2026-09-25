import { NextResponse } from "next/server";
import { authConfig, authConfigured, createAuthToken } from "../../../lib/auth";

export async function POST(request: Request) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: "Login is not configured. Add the Alumni login environment variables in Vercel." },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const config = authConfig();
  if (body.username !== config.username || body.password !== config.password) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  const token = await createAuthToken(config.username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("alumni_aiops_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
