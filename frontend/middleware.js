import { NextResponse } from 'next/server';

// ✅ Use globalThis.crypto from Web Crypto API (Edge compatible)
export function middleware(request) {
  try {
    // Generate a secure random nonce using Web Crypto (Edge-safe)
    const array = new Uint8Array(16);
    globalThis.crypto.getRandomValues(array);
    const nonce = Buffer.from(array).toString('base64');

    const response = NextResponse.next();
    const headers = new Headers(response.headers);

    const existingCSP = headers.get('Content-Security-Policy') || '';
    const updatedCSP = existingCSP
      .replace(/{NONCE}/g, nonce)
      .replace(/\s{2,}/g, ' ')
      .trim();

    headers.set('Content-Security-Policy', updatedCSP);
    headers.set('x-csp-nonce', nonce);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('❌ CSP Middleware Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|security.txt).*)'],
};
