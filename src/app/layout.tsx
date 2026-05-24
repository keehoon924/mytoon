import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyToon — 한 줄로 만드는 나만의 인스타툰",
  description:
    "한 줄만 적으면 AI가 인스타툰으로 그려줘요. 캐릭터를 등록하고, 컷을 편집하고, 한 번에 공유까지.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jua&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
