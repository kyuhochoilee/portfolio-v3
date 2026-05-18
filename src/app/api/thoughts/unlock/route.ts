import { NextResponse } from "next/server";
import {
  THOUGHTS_COOKIE,
  THOUGHTS_COOKIE_MAX_AGE,
  expectedToken,
  tokenForPassword,
} from "@/lib/thoughtsAuth";

export async function POST(request: Request) {
  const expected = expectedToken();
  if (!expected) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  if (!password || tokenForPassword(password) !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: THOUGHTS_COOKIE,
    value: expected,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THOUGHTS_COOKIE_MAX_AGE,
  });
  return res;
}
