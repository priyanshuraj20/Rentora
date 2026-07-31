import * as Sentry from "@sentry/node";
import { env } from "./env";

export const initSentry = () => {
  if (!env.SENTRY_DSN) {
    console.warn(" SENTRY_DSN not set — error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0, // 100% of transactions traced — lower this in real prod (e.g. 0.1) to control cost/volume
  });
};
