import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionFromRequest, type SessionPayload } from "@/lib/auth";

export async function requireAdminFromRequest(req: NextRequest): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: NextResponse }
> {
  const session = await getSessionFromRequest(req);
  if (!session) return { ok: false, response: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  if (session.role !== "ADMIN") return { ok: false, response: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }) };
  return { ok: true, session };
}

export async function requireAdminPage(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}
