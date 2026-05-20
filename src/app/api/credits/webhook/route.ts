import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { tossWebhookSecret } from "@/lib/toss";
import { markOrderPaid, markOrderFailed, markOrderCanceled } from "@/lib/paymentSettle";

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const secret = tossWebhookSecret();
  if (secret) {
    const sig = req.headers.get("toss-signature");
    if (!verifySignature(rawBody, sig, secret)) {
      return NextResponse.json({ error: "서명 검증 실패" }, { status: 401 });
    }
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: "JSON 파싱 실패" }, { status: 400 }); }

  const ev = payload as {
    eventType?: string;
    data?: { paymentKey?: string; orderId?: string; status?: string; totalAmount?: number };
  };
  const data = ev.data;
  if (!data?.orderId) return NextResponse.json({ error: "orderId 누락" }, { status: 400 });

  const status = data.status ?? ev.eventType;

  if (status === "DONE" || status === "PAYMENT.DONE") {
    if (!data.paymentKey || typeof data.totalAmount !== "number") {
      return NextResponse.json({ error: "결제 정보 누락" }, { status: 400 });
    }
    const settled = await markOrderPaid(data.orderId, data.paymentKey, data.totalAmount);
    if (!settled.ok) return NextResponse.json({ error: settled.error }, { status: settled.status });
    return NextResponse.json({ ok: true });
  }
  if (status === "CANCELED" || status === "ABORTED") {
    await markOrderCanceled(data.orderId);
    return NextResponse.json({ ok: true });
  }
  if (status === "FAILED" || status === "EXPIRED") {
    await markOrderFailed(data.orderId, status);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: status });
}
