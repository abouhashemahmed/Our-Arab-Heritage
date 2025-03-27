import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const nonce = ctx.req?.headers?.get?.('x-csp-nonce') || '';
    const initialTheme = ctx.req?.cookies?.theme || 'light';
    const locale = ctx.locale || 'en';

    if (process.env.NODE_ENV === 'production') {
      const noncePattern = /^[a-zA-Z0-9_-]{20,}$/;
      if (!noncePattern.test(nonce)) {
        console.warn('⚠️ Falling back to minimal CSP due to nonce failure');
        ctx.res?.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; report-uri https://your-report-uri.com"
        );
        throw new Error('CSP validation failed - invalid nonce');
      }
    }

    return { ...initialProps, nonce, initialTheme, locale };
  }

  render() {
    const { nonce, initialTheme, locale } = this.props;

    return (
      <Html
        lang={locale}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        className={initialTheme}
        data-color-mode={initialTheme}
      >
        <Head nonce={nonce}>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#3FA66A" />
          <meta
            name="description"
            content="Our Arab Heritage – Discover and support authentic Arab creators."
          />

          {/* 🔵 Core Resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" nonce={nonce} />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
            nonce={nonce}
          />
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            as="style"
            nonce={nonce}
          />

          {/* 🟢 Optional: Arabic Font Preload */}
          <link
            rel="preload"
            href="/fonts/ArabicFont.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            nonce={nonce}
          />

          {/* ✅ Font CSS with Real SRI */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            nonce={nonce}
            integrity="sha384-svBAqD4Vz45Q68wqCyyGMvX8idNxcJ66AFD3MQBxw9bcQ4jAzeEr8lgFiygi5hmI"
            crossOrigin="anonymous"
          />

          {/* 🟢 Optional: Favicon Nonce */}
          <link rel="icon" href="/favicon.ico" nonce={nonce} />

          {/* 🔵 Nonce Propagation */}
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
                window.__nonce__ = '${nonce}';
                window.__CSP_REPORT_URI__ = '${process.env.CSP_REPORT_URI || ''}';
                
                // 🟢 Optional: Client-side error tracking
                window.onerror = function(msg, url, line) {
                  if (window.__CSP_REPORT_URI__) {
                    fetch(window.__CSP_REPORT_URI__, {
                      method: 'POST',
                      body: JSON.stringify({
                        error: { message: msg, url: url, line: line },
                        timestamp: new Date().toISOString()
                      }),
                      headers: { 'Content-Type': 'application/json' }
                    });
                  }
                };
              `,
            }}
          />

          {/* 🟢 Optional: Performance Monitoring */}
          {process.env.NEXT_PUBLIC_PERF_KEY && (
            <script
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `
                  if(window.__perfSetup) return;
                  window.__perfSetup = true;
                  window.addEventListener('load', () => {
                    const timing = performance.timing;
                    const metrics = {
                      dns: timing.domainLookupEnd - timing.domainLookupStart,
                      tcp: timing.connectEnd - timing.connectStart,
                      ttfb: timing.responseStart - timing.requestStart,
                      domLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                      pageLoaded: timing.loadEventEnd - timing.navigationStart
                    };
                    console.debug('Perf Metrics:', metrics);
                    ${
                      process.env.NODE_ENV === 'production'
                        ? `navigator.sendBeacon('${process.env.NEXT_PUBLIC_PERF_KEY}', JSON.stringify(metrics));`
                        : ''
                    }
                  });
                `,
              }}
            />
          )}
        </Head>

        <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
