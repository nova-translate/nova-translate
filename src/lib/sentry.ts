import * as Sentry from "@sentry/react";

// Sentry can be initialized here because this is a tab/popup and is not a shared environment
// NOTE: Please be wary of this as it will include code that lazy loads sentry code. This could
// result in the stores rejecting your submission.
Sentry.init({
  dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.browserProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

export default Sentry;
