import { NextResponse } from "next/server";
import { logoutCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "로그아웃 완료" });
  res.cookies.set(logoutCookieOptions());
  return res;
}
