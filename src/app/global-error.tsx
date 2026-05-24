"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-4xl mb-4">😵</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-sm text-gray-500 mb-6">
            일시적인 오류입니다. 잠시 후 다시 시도해 주세요.
          </p>
          <button
            onClick={reset}
            className="rounded-full bg-[#7CAF8A] px-6 py-2 text-sm font-medium text-white hover:bg-[#6A9E78]"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
