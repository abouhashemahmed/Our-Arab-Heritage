// sentry.server.config.js
import * as Sentry from "@sentry/nextjs";
import { RewriteFrames, LinkedErrors } from "@sentry/integrations";

// 🔁 Versioning
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";
const APP_VERSION = process.env.npm_package_version || "0.0.0";

// 🌍 Environment
const ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";

// 🚨 DSN Validation
if (ENV !== "development") {
  if (!process.env.SENTRY_DSN) {
    console.error("❌ Sentry DSN is required in non-development environments!");
    process.exit(1);
  }
  if (!process.env.SENTRY_DSN.startsWith("https://")) {
    console.error("❌ Invalid Sentry DSN format!");
    process.exit(1);
  }
}

// 🛠️ Sentry Initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  environment: ENV,
  release: `our-arab-heritage@${APP_VERSION}-${COMMIT_SHA}`,

  ignoreErrors: [
    "NonErrorReservedFetchError",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    /APIError: 5\d{2}/,
    /bot/i,
    /crawler/i,
  ],

  tracesSampler: (ctx) => {
    if (ENV === "development") return 1.0;
    if (ctx.request?.url?.includes("/api")) return 0.2;
    return parseFloat(process.env.SENTRY_TRACE_RATE) || 0.1;
  },
  profilesSampleRate: ENV === "production" ? 0.05 : 1.0,
  enableTracing: true,

  integrations: [
    new RewriteFrames({
      root: process.env.NEXT_PUBLIC_SENTRY_ROOT_DIR || process.cwd(),
    }),
    new LinkedErrors({ key: "cause", limit: 5 }),
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express(),
    new Sentry.Integrations.Session({
      stickySession: true,
    }),
  ],

  beforeSend(event) {
    if (event.request?.url?.match(/\/api\/(health|ping)/)) return null;

    event.tags = {
      ...event.tags,
      runtime: process.env.NEXT_RUNTIME || "nodejs",
      region: process.env.VERCEL_REGION || "local",
      commit_sha: COMMIT_SHA,
    };

    return event;
  },

  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /safari-extension/i,
  ],

  attachStacktrace: true,
  normalizeDepth: 5,

  debug: process.env.NEXT_PUBLIC_SENTRY_DEBUG === "true",

  _metadata: {
    sdk: {
      name: "sentry.javascript.nextjs",
      version: "7.66.0"
    }
  },

  _experiments: {
    captureServerComponentError: true,
    enableInteractions: true,
  }
});
