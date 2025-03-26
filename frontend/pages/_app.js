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

// Dynamic imports with SSR disabled
const ToastNotifications = dynamic(() => import("@/components/ToastNotifications"), { ssr: false });
const CookieConsentBanner = dynamic(() => import("@/components/CookieConsent"), { ssr: false });

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const themeButtonRef = useRef(null);

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  // 1. Route handling with error tracking
  useEffect(() => {
    const handleRouteChange = (url) => {
      NProgress.start();
      setIsLoading(true);
      
      // Load analytics if consented
      if (consentGiven && process.env.NEXT_PUBLIC_GA_ID) {
        window.gtag?.('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
          theme: isDark ? 'dark' : 'light'
        });
      }
    };

    const handleRouteComplete = () => {
      NProgress.done();
      setIsLoading(false);
    };

    const handleRouteError = (err) => {
      NProgress.done();
      setIsLoading(false);
      setError(err);
      Sentry.captureException(err);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);
    router.events.on('routeChangeError', handleRouteError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
      router.events.off('routeChangeError', handleRouteError);
    };
  }, [router, consentGiven, isDark]);

  // 2. Theme management with system preference
  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.style.colorScheme = newTheme;
    localStorage.setItem('theme', newTheme);
    Cookies.set('theme', newTheme, { expires: 365, sameSite: 'Lax' });
    setIsDark(!isDark);
  }, [isDark]);

  // 3. Theme button click handler (CSP compliant)
  useEffect(() => {
    const button = themeButtonRef.current;
    if (button) button.addEventListener('click', toggleTheme);
    return () => {
      if (button) button.removeEventListener('click', toggleTheme);
    };
  }, [toggleTheme]);

  // 4. Initial theme setup
  useEffect(() => {
    const root = document.documentElement;
    const theme = Cookies.get('theme') || 
                  localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    setIsDark(theme === 'dark');
    setConsentGiven(Cookies.get('cookie_consent') === 'true');
  }, []);

  return (
    <ErrorBoundary error={error} onReset={() => setError(null)}>
      <AuthProvider>
        <CartProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content={isDark ? '#1A1A1A' : '#3FA66A'} />
          </Head>

          <CookieConsentBanner
            onConsent={() => {
              Cookies.set('cookie_consent', 'true', { expires: 365, sameSite: 'Lax' });
              setConsentGiven(true);
            }}
          />

          <div id="skip-nav">
            <a href="#main-content" className="sr-only focus:not-sr-only">
              Skip to content
            </a>
          </div>

          {isLoading && (
            <motion.div
              className="fixed top-0 left-0 h-1 bg-ourArabGreen-400 z-50"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
            />
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {getLayout(<Component {...pageProps} />}
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
