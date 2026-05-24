import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF5] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#7CAF8A] hover:underline">
            ← MyToon 홈
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">개인정보처리방침</h1>
          <p className="mt-2 text-sm text-gray-500">최종 수정일: 2026년 5월 1일 · 시행일: 2026년 5월 1일</p>
        </div>

        {/* 목차 */}
        <nav className="mb-10 rounded-xl border border-[#E8F0EB] bg-white p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">목차</p>
          <ol className="space-y-1.5 text-sm text-[#7CAF8A]">
            {[
              ["1", "수집하는 개인정보 항목"],
              ["2", "개인정보 수집 및 이용 목적"],
              ["3", "개인정보 보유 및 이용 기간"],
              ["4", "개인정보 제3자 제공"],
              ["5", "개인정보 처리 위탁"],
              ["6", "이용자의 권리"],
              ["7", "쿠키 및 세션"],
              ["8", "베타 기간 데이터 처리"],
              ["9", "개인정보 보호책임자"],
            ].map(([num, title]) => (
              <li key={num}>
                <a href={`#priv-${num}`} className="hover:underline">
                  제 {num}조 {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 본문 */}
        <div className="space-y-10 text-sm leading-relaxed text-gray-700">
          <section id="priv-1">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 1조 수집하는 개인정보 항목</h2>
            <div className="overflow-hidden rounded-xl border border-[#E8F0EB]">
              <table className="w-full text-sm">
                <thead className="bg-[#F0F7F2]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">수집 항목</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">수집 방법</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">필수 여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F0EB]">
                  <tr className="bg-white">
                    <td className="px-4 py-3">이메일 주소</td>
                    <td className="px-4 py-3">회원가입 시 직접 입력</td>
                    <td className="px-4 py-3">필수</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3">비밀번호 (bcrypt 해시값만 저장)</td>
                    <td className="px-4 py-3">회원가입 시 직접 입력</td>
                    <td className="px-4 py-3">필수</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3">서비스 이용 기록 (로그인 일시, 생성 이력)</td>
                    <td className="px-4 py-3">서비스 이용 시 자동 수집</td>
                    <td className="px-4 py-3">필수</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3">업로드 이미지 (캐릭터 참조 사진)</td>
                    <td className="px-4 py-3">사용자 직접 업로드</td>
                    <td className="px-4 py-3">선택</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              ※ 베타 기간 중 결제 기능을 운영하지 않으므로 결제 정보(신용카드, 계좌번호 등)는 수집하지 않습니다.
            </p>
          </section>

          <section id="priv-2">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 2조 개인정보 수집 및 이용 목적</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>회원 식별 및 인증</li>
              <li>서비스 제공 및 개인화 (AI 생성, 프로젝트 저장)</li>
              <li>서비스 품질 개선 및 신규 기능 개발</li>
              <li>이용 통계 분석 (비식별 처리)</li>
              <li>불법·부정 이용 방지 및 고객 지원</li>
              <li>서비스 관련 공지·안내 이메일 발송</li>
            </ul>
          </section>

          <section id="priv-3">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 3조 개인정보 보유 및 이용 기간</h2>
            <p className="mb-2">
              회원 탈퇴 시 지체 없이 개인정보를 삭제합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한
              경우에는 해당 법령에서 정한 기간 동안 보관합니다.
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>전자상거래 기록: 5년 (전자상거래법)</li>
              <li>서비스 이용 로그: 3개월</li>
            </ul>
          </section>

          <section id="priv-4">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 4조 개인정보 제3자 제공</h2>
            <p>
              MyToon 운영팀은 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 단, 이용자의
              사전 동의가 있거나 법령에 근거한 경우는 예외입니다.
            </p>
          </section>

          <section id="priv-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 5조 개인정보 처리 위탁</h2>
            <div className="overflow-hidden rounded-xl border border-[#E8F0EB]">
              <table className="w-full text-sm">
                <thead className="bg-[#F0F7F2]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">수탁업체</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F0EB]">
                  <tr className="bg-white">
                    <td className="px-4 py-3">OpenAI</td>
                    <td className="px-4 py-3">AI 이미지 생성 처리 (입력 프롬프트 전달)</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3">Amazon Web Services (AWS)</td>
                    <td className="px-4 py-3">이미지 파일 저장 (S3)</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3">Resend</td>
                    <td className="px-4 py-3">이메일 발송 (인증 메일)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="priv-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 6조 이용자의 권리</h2>
            <p className="mb-2">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="list-inside list-disc space-y-1">
              <li>개인정보 열람 요청</li>
              <li>오류 정정 요청</li>
              <li>삭제 요청 (회원 탈퇴)</li>
              <li>처리 정지 요청</li>
            </ul>
            <p className="mt-2">
              권리 행사는{" "}
              <a href="mailto:edcrfv51@gmail.com" className="text-[#7CAF8A] underline">
                edcrfv51@gmail.com
              </a>
              으로 요청해 주세요. 10영업일 이내에 처리합니다.
            </p>
          </section>

          <section id="priv-7">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 7조 쿠키 및 세션</h2>
            <p>
              서비스는 로그인 상태 유지를 위해 HTTP-Only 쿠키 방식의 세션 토큰을 사용합니다. 브라우저
              설정에서 쿠키를 차단할 경우 로그인 기능이 정상 작동하지 않을 수 있습니다.
            </p>
          </section>

          <section id="priv-8">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 8조 베타 기간 데이터 처리</h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">베타 기간 중 데이터 관련 안내</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-700">
                <li>
                  베타 서비스 운영 중 서비스 안정화, 개선 등의 목적으로 <strong>저장된 데이터가 삭제 또는 초기화될 수 있습니다.</strong>
                </li>
                <li>데이터 초기화 전 7일 이전에 이메일로 사전 공지합니다.</li>
                <li>베타 종료 시 데이터 이관 여부는 별도 공지합니다.</li>
                <li>중요한 콘텐츠는 내보내기 기능을 이용해 별도 보관하세요.</li>
              </ul>
            </div>
          </section>

          <section id="priv-9">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 9조 개인정보 보호책임자</h2>
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-4">
              <p><span className="font-medium">운영 주체:</span> MyToon 운영팀</p>
              <p className="mt-1">
                <span className="font-medium">이메일:</span>{" "}
                <a href="mailto:edcrfv51@gmail.com" className="text-[#7CAF8A] underline">
                  edcrfv51@gmail.com
                </a>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                개인정보 관련 문의, 불만 처리, 피해 구제 등을 위해 위 이메일로 연락해 주세요.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 border-t border-[#E8F0EB] pt-8 text-center text-xs text-gray-400">
          <Link href="/terms" className="hover:text-[#7CAF8A]">이용약관</Link>
          <span className="mx-2">·</span>
          <Link href="/" className="hover:text-[#7CAF8A]">MyToon 홈</Link>
        </div>
      </div>
    </main>
  );
}
