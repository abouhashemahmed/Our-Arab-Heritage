import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Head from "next/head";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import NProgress from "nprogress";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie";
import "@/styles/globals.css";
import "nprogress/nprogress.css";

// Dynamic imports (no SSR)
const ToastNotifications = dynamic(() => import("@/components/ToastNotifications"), { ssr: false });
const CookieConsentBanner = dynamic(() => import("@/components/CookieConsent"), { ssr: false });

// 🟡 Optional: Custom error fallback component
const ErrorFallback = ({ error, resetError }) => (
  <div role="alert" className="p-8 text-red-600 bg-red-50">
    <h2 className="text-2xl font-bold">Something went wrong:</h2>
    <pre className="mt-4">{error.message}</pre>
    <button 
      onClick={resetError}
      className="px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const themeButtonRef = useRef(null);
  const nonce = pageProps?.nonce || '';

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  // Route handling with error tracking
  useEffect(() => {
    const handleRouteChangeStart = () => {
      NProgress.start();
      setIsLoading(true);
    };

    const handleRouteChangeComplete = (url) => {
      NProgress.done();
      setIsLoading(false);

      // 🟡 Optional: Post-HOC analytics
      if (typeof window !== 'undefined' && consentGiven && process.env.NEXT_PUBLIC_GA_ID) {
        window.gtag?.('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
          theme: isDark ? 'dark' : 'light',
          transport_type: 'beacon',
        });
      }
    };

    const handleRouteError = (err) => {
      NProgress.done();
      setIsLoading(false);
      setError(err);
      Sentry.captureException(err);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteError);
    };
  }, [router, consentGiven, isDark]);

  // Theme management
  const toggleTheme = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.style.colorScheme = newTheme;
    localStorage.setItem('theme', newTheme);
    Cookies.set('theme', newTheme, {
      expires: 365,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setIsDark(!isDark);
  }, [isDark]);

  // Theme button handler (CSP-safe)
  useEffect(() => {
    const button = themeButtonRef.current;
    button?.addEventListener('click', toggleTheme);
    return () => button?.removeEventListener('click', toggleTheme);
  }, [toggleTheme]);

  // System preference tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addListener(handleSystemChange);
    return () => mediaQuery.removeListener(handleSystemChange);
  }, []);

  // Initial setup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const theme =
      Cookies.get('theme') ||
      localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    setIsDark(theme === 'dark');
    setConsentGiven(Cookies.get('cookie_consent') === 'true');
  }, []);

  return (
    <ErrorBoundary 
      error={error} 
      onReset={() => setError(null)}
      FallbackComponent={ErrorFallback} // 🟡 Optional error UI
    >
      <AuthProvider>
        <CartProvider>
          <Head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content={isDark ? '#1A1A1A' : '#3FA66A'} />

            {/* 🟡 Optional: Protected Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                      page_path: window.location.pathname,
                      transport_type: 'beacon'
                    });
                  `,
                }}
              />
            )}

            {/* 🟡 Optional: Font optimization */}
            <link
              rel="preload"
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
              as="style"
              nonce={nonce}
            />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
              nonce={nonce}
            />
          </Head>

          <CookieConsentBanner
            onConsent={() => {
              Cookies.set('cookie_consent', 'true', {
                expires: 365,
                sameSite: 'Lax',
                secure: process.env.NODE_ENV === 'production',
              });
              setConsentGiven(true);
            }}
          />

          {/* Accessibility */}
          <div id="skip-nav">
            <a href="#main-content" className="sr-only focus:not-sr-only">
              Skip to content
            </a>
          </div>

          {/* 🟡 Optional: Enhanced loading indicator */}
          {isLoading && (
            <motion.div
              className="fixed top-0 left-0 h-1 bg-ourArabGreen-400 z-50"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
              style={{ willChange: 'width' }}
            >
              <div className="absolute right-0 w-3 h-full animate-pulse bg-ourArabGreen-600" />
            </motion.div>
          )}

          <button
            ref={themeButtonRef}
            className="fixed bottom-4 right-4 p-3 rounded-full bg-ourArabGreen-500 text-white shadow-lg hover:bg-ourArabGreen-600 transition-colors"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              id="main-content"
              key={router.asPath}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                bounce: 0,
              }}
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