import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Head from "next/head";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import NProgress from "nprogress";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie";
import "@/styles/globals.css";
import "nprogress/nprogress.css";

const ToastNotifications = dynamic(
  () => import("@/components/ToastNotifications"),
  { ssr: false }
);

const CookieConsentBanner = dynamic(
  () => import("@/components/CookieConsent"),
  { ssr: false }
);

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  // 1. Route transitions + error logging
  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
      setIsLoading(true);
    };

    const handleComplete = () => {
      NProgress.done();
      setIsLoading(false);
    };

    const handleError = (err) => {
      NProgress.done();
      setIsLoading(false);
      setError(err);
      Sentry.captureException(err);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleError);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleError);
    };
  }, [router]);

  // 2. Initial theme + cookie consent check
  useEffect(() => {
    const root = document.documentElement;
    const cookieTheme = Cookies.get("theme");
    const storedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme = cookieTheme || storedTheme || (systemDark ? "dark" : "light");
    const hasConsent = Cookies.get("cookie_consent") === "true";

    setIsDark(initialTheme === "dark");
    setConsentGiven(hasConsent);

    root.classList.toggle("dark", initialTheme === "dark");
    root.style.colorScheme = initialTheme;
    Cookies.set("theme", initialTheme, { expires: 365 });
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    Cookies.set("theme", newTheme, { expires: 365 });

    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.documentElement.style.colorScheme = newTheme;
    setIsDark(!isDark);
  };

  // 3. Google Analytics tracking (if consent given)
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (consentGiven && process.env.NEXT_PUBLIC_GA_ID) {
        window.gtag?.("config", process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
          theme: isDark ? "dark" : "light",
        });
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events, isDark, consentGiven]);

  const resetError = () => setError(null);

  return (
    <ErrorBoundary error={error} onReset={resetError}>
      <AuthProvider>
        <CartProvider>
          {/* Cookie Consent Banner */}
          <CookieConsentBanner
            onConsent={() => {
              Cookies.set("cookie_consent", "true", { expires: 365 });
              setConsentGiven(true);
            }}
          />

          {/* Accessibility Skip Link */}
          <div id="skip-nav">
            <a href="#main-content" className="sr-only focus:not-sr-only">
              Skip to content
            </a>
          </div>

          {/* Head Tags */}
          <Head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="theme-color" content="#3FA66A" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
              rel="preload"
              as="style"
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            />
          </Head>

          {/* Route Loading Indicator */}
          {isLoading && (
            <motion.div
              className="fixed top-0 left-0 h-1 bg-ourArabGreen-400 z-50"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="fixed bottom-4 right-4 p-3 rounded-full bg-ourArabGreen-500 text-white shadow-lg hover:bg-ourArabGreen-600 transition-colors"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Animated Route Transition Wrapper */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              id="main-content"
              key={router.asPath}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              aria-busy={isLoading}
            >
              {getLayout(<Component {...pageProps} />)}
            </motion.main>
          </AnimatePresence>

          <ToastNotifications />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object,
};

