import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    const locale = "en"; // ✅ Make dynamic later for i18n support
    const dir = locale === "ar" ? "rtl" : "ltr";

    return (
      <Html lang={locale} dir={dir}>
        <Head>
          {/* Essential Meta */}
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#3FA66A" />
          <meta name="description" content="Our Arab Heritage – Discover and support authentic Arab creators." />

          {/* Fonts & Icons */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

