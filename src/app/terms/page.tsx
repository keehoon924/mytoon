import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF5] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#7CAF8A] hover:underline">
            ← MyToon 홈
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">이용약관</h1>
          <p className="mt-2 text-sm text-gray-500">최종 수정일: 2026년 5월 1일 · 시행일: 2026년 5월 1일</p>
        </div>

        {/* 목차 */}
        <nav className="mb-10 rounded-xl border border-[#E8F0EB] bg-white p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">목차</p>
          <ol className="space-y-1.5 text-sm text-[#7CAF8A]">
            {[
              ["1", "서비스 소개"],
              ["2", "이용 자격 및 계정"],
              ["3", "서비스 이용"],
              ["4", "크레딧 및 결제"],
              ["5", "지식재산권"],
              ["6", "금지 행위"],
              ["7", "서비스 변경 및 중단"],
              ["8", "베타 기간 특별 조항"],
              ["9", "면책 및 손해배상"],
              ["10", "준거법 및 분쟁 해결"],
              ["11", "문의"],
            ].map(([num, title]) => (
              <li key={num}>
                <a href={`#section-${num}`} className="hover:underline">
                  제 {num}조 {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 본문 */}
        <div className="space-y-10 text-sm leading-relaxed text-gray-700">
          <section id="section-1">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 1조 서비스 소개</h2>
            <p>
              MyToon(이하 "서비스")은 MyToon 운영팀이 제공하는 AI 기반 인스타툰 창작 웹 서비스입니다.
              이용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.
            </p>
          </section>

          <section id="section-2">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 2조 이용 자격 및 계정</h2>
            <p className="mb-2">
              만 14세 이상인 자라면 누구나 가입할 수 있습니다. 이용자는 본인 명의의 이메일 주소를 사용하여
              계정을 생성해야 하며, 계정 정보를 타인과 공유하거나 양도할 수 없습니다.
            </p>
            <p>
              부정한 방법으로 계정을 생성하거나 이용하는 경우 MyToon 운영팀은 해당 계정을 사전 통보 없이
              정지 또는 삭제할 수 있습니다.
            </p>
          </section>

          <section id="section-3">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 3조 서비스 이용</h2>
            <p className="mb-2">
              이용자는 서비스 내에서 캐릭터를 등록하고, AI를 활용해 인스타툰 컷을 생성·편집·저장·내보낼
              수 있습니다. 생성된 콘텐츠는 이용자의 계정에 저장되며, 이용자가 삭제하거나 서비스 운영팀이
              운영 정책에 따라 삭제할 때까지 유지됩니다.
            </p>
            <p>
              서비스는 OpenAI API 등 외부 AI 서비스를 이용하며, 해당 제공사의 이용 정책 변경에 따라 기능이
              달라질 수 있습니다.
            </p>
          </section>

          <section id="section-4">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 4조 크레딧 및 결제</h2>
            <p className="mb-2">
              서비스 이용에는 크레딧이 사용됩니다. 회원가입 시 50크레딧을 무료로 지급하며, 추가 크레딧은
              서비스 내 충전을 통해 획득할 수 있습니다.
            </p>
            <p className="mb-2">
              <strong>베타 기간 중에는 결제 기능을 운영하지 않습니다.</strong> 모든 크레딧은 운영팀의
              재량으로 무료 지급되며, 유료 구매한 크레딧에 대해서만 환불 요청이 가능합니다. 베타 기간 중
              무료 지급된 크레딧은 환불 대상이 아닙니다.
            </p>
          </section>

          <section id="section-5">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 5조 지식재산권</h2>
            <p className="mb-2">
              이용자가 서비스를 통해 생성한 콘텐츠의 저작권은 이용자에게 있습니다. 단, AI 생성 결과물의
              법적 저작권 귀속에 관해서는 관련 법령 및 판례의 해석을 따릅니다.
            </p>
            <p>
              MyToon 서비스 자체(UI, 코드, 브랜드 등)의 지식재산권은 MyToon 운영팀에 귀속됩니다.
            </p>
          </section>

          <section id="section-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 6조 금지 행위</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>타인의 개인정보를 무단 수집하거나 도용하는 행위</li>
              <li>서비스의 운영을 방해하거나 서버에 과도한 부하를 주는 행위</li>
              <li>음란물, 폭력적 콘텐츠 등 불법·반사회적 콘텐츠 생성</li>
              <li>타인의 저작권, 상표권 등 지식재산권을 침해하는 행위</li>
              <li>서비스를 통해 스팸, 광고, 사기 등 부적절한 행위</li>
            </ul>
          </section>

          <section id="section-7">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 7조 서비스 변경 및 중단</h2>
            <p>
              MyToon 운영팀은 운영상, 기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수
              있습니다. 중요한 변경 사항은 서비스 내 공지 또는 이메일을 통해 사전 안내합니다.
            </p>
          </section>

          <section id="section-8">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 8조 베타 기간 특별 조항</h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">베타 서비스 안내</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-700">
                <li>
                  베타 기간 중 서비스 품질 개선, 테스트 목적으로 <strong>저장된 데이터(프로젝트, 캐릭터 등)가 사전 통보 후 삭제 또는 초기화될 수 있습니다.</strong>
                </li>
                <li>중요한 작품은 내보내기 기능을 통해 별도 보관하시기 바랍니다.</li>
                <li>베타 기간 중 발생한 데이터 손실에 대해 운영팀은 책임을 지지 않습니다.</li>
                <li>베타 종료 시 정식 서비스로의 마이그레이션 정책은 별도 공지합니다.</li>
              </ul>
            </div>
          </section>

          <section id="section-9">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 9조 면책 및 손해배상</h2>
            <p className="mb-2">
              MyToon 운영팀은 서비스 이용으로 인한 직접적·간접적 손해에 대해 법령이 허용하는 최대한의 범위
              내에서 책임을 제한합니다.
            </p>
            <p>
              이용자의 귀책 사유로 타인에게 손해가 발생한 경우 이용자가 직접 책임을 집니다.
            </p>
          </section>

          <section id="section-10">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 10조 준거법 및 분쟁 해결</h2>
            <p>
              본 약관은 대한민국 법률에 따라 해석되며, 분쟁이 발생하는 경우 관할 법원은 서울중앙지방법원으로
              합니다.
            </p>
          </section>

          <section id="section-11">
            <h2 className="mb-3 text-lg font-bold text-gray-900">제 11조 문의</h2>
            <p>
              서비스 이용 관련 문의는{" "}
              <a
                href="mailto:edcrfv51@gmail.com"
                className="text-[#7CAF8A] underline"
              >
                edcrfv51@gmail.com
              </a>
              으로 연락해 주세요. 운영 주체: MyToon 운영팀
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-[#E8F0EB] pt-8 text-center text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-[#7CAF8A]">개인정보처리방침</Link>
          <span className="mx-2">·</span>
          <Link href="/" className="hover:text-[#7CAF8A]">MyToon 홈</Link>
        </div>
      </div>
    </main>
  );
}
