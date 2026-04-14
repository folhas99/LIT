type ErrorEntry = {
  timestamp: string;
  context: string;
  message: string;
  stack?: string;
};

const MAX_ERRORS = 100;

const errorLog: ErrorEntry[] = [];

export function logError(context: string, error: unknown): void {
  const entry: ErrorEntry = {
    timestamp: new Date().toISOString(),
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };

  errorLog.unshift(entry);

  if (errorLog.length > MAX_ERRORS) {
    errorLog.length = MAX_ERRORS;
  }

  // Forward to Sentry if configured (dynamic import — no hard dep at compile time)
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.withScope((scope) => {
          scope.setTag("context", context);
          if (error instanceof Error) {
            Sentry.captureException(error);
          } else {
            Sentry.captureMessage(String(error), "error");
          }
        });
      })
      .catch(() => {});
  }
}

export function getRecentErrors(): ErrorEntry[] {
  return [...errorLog];
}

export function clearErrors(): void {
  errorLog.length = 0;
}
