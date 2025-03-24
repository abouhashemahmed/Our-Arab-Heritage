// components/Layout.js
import PropTypes from "prop-types";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Layout({
  children,
  title = "Our Arab Heritage",
  description = "Explore and share Arab cultural treasures",
  locale = "en",
}) {
  const { asPath } = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "ourarabheritage.com";
  const canonicalUrl = `https://${siteUrl}${asPath}`;

  // Localized strings
  const t = {
    siteName: locale === "ar" ? "تراثنا العربي" : "Our Arab Heritage",
    skipLink: locale === "ar" ? "تخطى إلى المحتوى الرئيسي" : "Skip to main content",
    copyright: locale === "ar"
      ? "تراثنا العربي. جميع الحقوق محفوظة"
      : "Our Arab Heritage. All rights reserved",
    privacy: locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy",
    language: locale === "ar" ? "English" : "العربية",
    about: locale === "ar" ? "من نحن" : "About Us",
  };

  // Structured data for SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": t.siteName,
    "url": canonicalUrl,
    "description": description,
    "inLanguage": locale,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${canonicalUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${canonicalUrl}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${canonicalUrl}/og-image.jpg`} />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Head>

      {/* Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:px-4 focus:py-2 focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white dark:focus:bg-gray-800 focus:rounded transition-all"
      >
        {t.skipLink}
      </a>

      <div
        className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
        dir={dir}
        lang={locale}
      >
        {/* Navigation */}
        <nav className="border-b dark:border-gray-800" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <Link href="/" className="text-xl font-bold text-ourArabGreen-500 hover:text-ourArabGreen-600 transition-colors">
                {t.siteName}
              </Link>

              <div className="flex items-center space-x-4">
                <Link
                  href={asPath}
                  locale={locale === "ar" ? "en" : "ar"}
                  className="text-gray-500 dark:text-gray-400 hover:text-ourArabGreen-500 transition-colors text-sm"
                >
                  {t.language}
                </Link>

                <button
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={locale === "ar" ? "القائمة" : "Menu"}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main
          id="main-content"
          role="main"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t dark:border-gray-800">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} {t.copyright}
            </p>
            <div className="mt-2 space-x-4">
              <Link
                href="/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-ourArabGreen-500 text-sm transition-colors"
              >
                {t.privacy}
              </Link>
              <Link
                href="/about"
                className="text-gray-500 dark:text-gray-400 hover:text-ourArabGreen-500 text-sm transition-colors"
              >
                {t.about}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  locale: PropTypes.oneOf(["en", "ar"]),
};

