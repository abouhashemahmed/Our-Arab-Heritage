import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    
    // ✅ Safely get nonce from Edge headers
    const nonce = ctx.req?.headers?.get?.('x-csp-nonce') || '';

    // ✅ Optional: Validate nonce in production (good practice)
    if (process.env.NODE_ENV === 'production' && !/^[a-zA-Z0-9_-]{20,}$/.test(nonce)) {
      console.error('Invalid CSP nonce format:', nonce);
      throw new Error('CSP nonce validation failed');
    }

    return { ...initialProps, nonce };
  }

  render() {
    const { nonce } = this.props;

    return (
      <Html lang="en">
        <Head nonce={nonce}>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#3FA66A" />
          <meta
            name="description"
            content="Our Arab Heritage – Discover and support authentic Arab creators."
          />
          
          {/* ✅ Preload Google Fonts for better performance */}
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

          {/* ✅ Inline nonce propagation to JS */}
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window.__nonce__ = '${nonce}';`,
            }}
          />
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
