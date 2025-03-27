import { NextResponse } from 'next/server';

// ✅ Generate Edge-compatible, URL-safe base64 nonce
function generateNonce() {
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function middleware(request) {
  try {
    const nonce = generateNonce();
    const response = NextResponse.next();
    const headers = new Headers(response.headers);

    // ✅ Use existing CSP header or fallback
    const fallbackCSP = `
      default-src 'self';
      script-src 'self' 'nonce-{NONCE}' 'strict-dynamic';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data:;
      font-src 'self';
      connect-src 'self';
      object-src 'none';
      base-uri 'self';
      report-uri ${process.env.CSP_REPORT_URI || '/csp-report'};
    `.replace(/\n/g, ' ');

    const existingCSP = headers.get('Content-Security-Policy') || fallbackCSP;

    // ✅ Replace all {NONCE} with secure nonce
    const updatedCSP = existingCSP
      .replace(/{NONCE}/g, nonce)
      .replace(/\s{2,}/g, ' ')
      .trim();

    headers.set('Content-Security-Policy', updatedCSP);
    headers.set('x-csp-nonce', nonce);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(headers.entries()),
    });
  } catch (error) {
    console.error('❌ CSP Middleware Error:', error);
    return new NextResponse(null, {
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self';"
      }
    });
  }
}

export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'
  ],
};
