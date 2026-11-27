'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

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
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border border-slate-800 bg-slate-900 text-center space-y-4">
          <h2 className="text-2xl font-bold text-amber-400">Unexpected Platform Error</h2>
          <p className="text-sm text-slate-300">
            An unexpected error occurred and has been reported to monitoring.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-amber-600 text-white font-semibold text-sm hover:bg-amber-500 transition"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
