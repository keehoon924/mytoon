export const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export function tossClientKey(): string {
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
}

function tossSecretKey(): string {
  return process.env.TOSS_SECRET_KEY ?? "test_sk_docs_Ovk5rk1EwkEbP0W43n07xlzm";
}

export function tossAuthHeader(): string {
  const key = tossSecretKey() + ":";
  return "Basic " + Buffer.from(key).toString("base64");
}

export function tossWebhookSecret(): string | null {
  return process.env.TOSS_WEBHOOK_SECRET ?? null;
}
