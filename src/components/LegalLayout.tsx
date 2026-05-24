import Link from "next/link";

export default function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-ink">
      <header className="border-b border-line/70 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-primary text-base shadow-[var(--shadow-1)]">🎨</span>
            <span className="font-heading text-xl text-primary">MyToon</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-primary">← 홈으로</Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-heading text-3xl text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-subtle">시행일 {updated}</p>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-line bg-surface-soft px-4 py-3 text-sm text-muted">
          MyToon은 현재 <strong className="text-ink">베타 서비스</strong>입니다. 베타 기간 중에는 서비스 안정화를 위해 데이터가 삭제·초기화될 수 있습니다.
        </div>

        <div className="legal mt-8 flex flex-col gap-8 text-[15px] leading-relaxed text-ink">
          {children}
        </div>

        <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">
          <p>운영: MyToon 운영팀 · 문의: <a href="mailto:edcrfv51@gmail.com" className="text-primary hover:underline">edcrfv51@gmail.com</a></p>
          <div className="mt-2 flex gap-4">
            <Link href="/terms" className="hover:text-primary">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary">개인정보처리방침</Link>
          </div>
        </footer>
      </article>
    </main>
  );
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-xl text-ink">{heading}</h2>
      <div className="mt-2 flex flex-col gap-2 text-muted">{children}</div>
    </section>
  );
}
