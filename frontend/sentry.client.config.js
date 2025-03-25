// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";
import { BrowserTracing, Replay } from "@sentry/browser";

// 🔁 Version & Environment
const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";
const VERSION = process.env.npm_package_version || "0.0.0";
const ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  environment: ENV,
  release: `our-arab-heritage@${VERSION}-${COMMIT_SHA}`,

  // 🎯 Performance Sampling
  tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACE_RATE) || 0.1,
  profilesSampleRate: ENV === "production" ? 0.05 : 1.0,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,

  // 🧩 Integrations
  integrations: [
    new BrowserTracing({
      tracingOrigins: [
        process.env.NEXT_PUBLIC_API_BASE_URL,
        /\.ourarabheritage\.com$/,
      ],
    }),
    new Replay({
      maskAllText: true,
      blockAllMedia: true,
      networkDetailAllowUrls: [/ourarabheritage\.com/],
    }),
    new Sentry.Feedback({
      colorScheme: 'system',
      buttonLabel: 'Report Bug',
    }),
  ],

  // 🚫 Error Filtering
  beforeSend(event) {
    const ignorePaths = ["/privacy", "/auth/(.*)", "/api/health"];
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (new RegExp(ignorePaths.join("|")).test(path)) return null;
    }

    // Clean sensitive request data
    delete event.request?.cookies;

    // Add infrastructure metadata
    event.tags = {
      ...event.tags,
      runtime: typeof window !== "undefined" ? "browser" : "unknown",
      commit_sha: COMMIT_SHA,
      env: ENV,
      version: VERSION,
    };

    return event;
  },

  // 🔍 Breadcrumb Filtering
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'xhr' && breadcrumb.data?.url?.includes('/health')) {
      return null;
    }
    return breadcrumb;
  },

  // 🔒 Security & Filtering
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /safari-extension/i,
  ],
  sendDefaultPii: false,

  // 🐛 Debugging & Experiments
  debug: process.env.NEXT_PUBLIC_SENTRY_DEBUG === "true",
  _experiments: {
    captureExceptions: true,
    tracing: true,
  },
});

// 🔐 User Identification
let isIdentified = false;

export function identifyUser(user) {
  if (!user || isIdentified) return;

  Sentry.setUser({
    id: user.id,
    email: user.email?.replace(/(?<=.).(?=.*@)/g, "*"), // Obfuscate email
    username: user.username,
    role: user.role || "guest",
  });

  Sentry.setTag("user.segment", user.segment || "unclassified");
  isIdentified = true;
}

// 🧹 Clear user on logout
export function clearUser() {
  Sentry.setUser(null);
  isIdentified = false;
}

