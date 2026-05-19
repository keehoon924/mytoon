import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "noreply@mytoon.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${html}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await send(
    to,
    "[MyToon] 이메일 인증",
    `<p>아래 링크를 클릭해 이메일 인증을 완료하세요.</p><a href="${url}">${url}</a><p>링크는 24시간 후 만료됩니다.</p>`
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await send(
    to,
    "[MyToon] 비밀번호 재설정",
    `<p>아래 링크를 클릭해 비밀번호를 재설정하세요.</p><a href="${url}">${url}</a><p>링크는 1시간 후 만료됩니다.</p>`
  );
}
