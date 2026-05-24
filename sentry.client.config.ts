import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay may only be enabled for the client-side
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Capture Replay for 10% of all sessions in production
  replaysSessionSampleRate: 0.1,

  // Capture Replay for 100% of sessions with an error
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production to avoid noise in development
  enabled: process.env.NODE_ENV === "production",
});
