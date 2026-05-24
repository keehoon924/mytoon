import type { Metadata } from "next";
import LegalLayout, { Section } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "개인정보처리방침 — MyToon" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="개인정보처리방침" updated="2026-05-24">
      <Section heading="1. 총칙">
        <p>MyToon 운영팀(이하 &ldquo;회사&rdquo;)은 이용자의 개인정보를 중요시하며, 개인정보 보호법 및 정보통신망 이용촉진 및 정보보호 등에 관한 법률을 준수합니다. 본 방침은 회사가 제공하는 MyToon 서비스에 적용됩니다.</p>
      </Section>

      <Section heading="2. 수집하는 개인정보 항목">
        <p>회사는 다음의 개인정보를 수집합니다.</p>
        <p>• 필수: 이메일 주소, 비밀번호(암호화하여 저장)</p>
        <p>• 자동 생성: 이용 기록(생성한 작품·캐릭터·크레딧 거래 내역), 접속 일시</p>
        <p>※ 베타 기간 중에는 결제를 진행하지 않으므로 결제정보를 수집하지 않습니다.</p>
      </Section>

      <Section heading="3. 개인정보의 수집 및 이용 목적">
        <p>• 회원 식별 및 로그인, 서비스 제공</p>
        <p>• 크레딧 관리 및 AI 생성 기능 제공</p>
        <p>• 서비스 개선, 통계 분석(주간 활성 사용자 등), 고객 문의 대응</p>
        <p>• 부정 이용 방지 및 콘텐츠 신고 처리</p>
      </Section>

      <Section heading="4. 개인정보의 보유 및 이용 기간">
        <p>1. 회원 탈퇴 시 지체 없이 파기함을 원칙으로 합니다. 단, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
        <p>2. 베타 기간 중에는 서비스 안정화를 위해 데이터가 삭제·초기화될 수 있습니다.</p>
      </Section>

      <Section heading="5. 개인정보의 제3자 제공">
        <p>회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만 법령에 의거하거나 수사기관의 적법한 요청이 있는 경우는 예외로 합니다.</p>
      </Section>

      <Section heading="6. 개인정보 처리의 위탁">
        <p>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁할 수 있으며, 위탁받은 자가 관계 법령을 준수하도록 관리·감독합니다.</p>
        <p>• 이미지 저장: 클라우드 스토리지(AWS S3 / Cloudflare R2)</p>
        <p>• AI 생성: OpenAI (입력 텍스트·이미지 처리)</p>
        <p>• 이메일 발송: Resend</p>
        <p>• 오류·이용 분석: Sentry, Vercel Analytics</p>
      </Section>

      <Section heading="7. 이용자의 권리">
        <p>이용자는 언제든지 자신의 개인정보를 조회·수정하거나 회원탈퇴를 통해 삭제를 요청할 수 있습니다. 설정 화면에서 직접 수행하거나 문의 이메일로 요청할 수 있습니다.</p>
      </Section>

      <Section heading="8. 개인정보의 파기">
        <p>개인정보는 보유 기간이 경과하거나 처리 목적이 달성되면 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로 삭제합니다.</p>
      </Section>

      <Section heading="9. 개인정보의 안전성 확보 조치">
        <p>회사는 비밀번호 암호화 저장, 접근 권한 통제, 전송 구간 암호화(HTTPS) 등 합리적인 보호 조치를 시행합니다.</p>
      </Section>

      <Section heading="10. 개인정보 보호책임자">
        <p>• 개인정보 보호책임자: MyToon 운영팀</p>
        <p>• 연락처: edcrfv51@gmail.com</p>
        <p>개인정보 관련 문의·불만·피해 구제는 위 연락처로 접수할 수 있습니다.</p>
      </Section>

      <Section heading="11. 고지의 의무">
        <p>본 방침의 내용 추가·삭제·수정이 있을 경우 시행일 전에 서비스 화면을 통해 공지합니다.</p>
      </Section>
    </LegalLayout>
  );
}
