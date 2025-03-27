const crypto = require('crypto');

// 🔒 Security headers (beyond CSP)
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), fullscreen=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

// 🛡️ Content Security Policy
const ContentSecurityPolicy = `
  default-src 'self' ourarabheritage.com;
  script-src 'self' 'strict-dynamic' 'nonce-{NONCE}' ${
    process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""
  };
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: res.cloudinary.com via.placeholder.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  connect-src 'self' ${
    process.env.NODE_ENV === 'development' ? "http://localhost:3000 " : ""
  }https://our-arab-heritage-production.up.railway.app https://api.stripe.com;
  frame-src 'self' https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  report-uri ${
    process.env.NODE_ENV === 'development' 
      ? 'none' 
      : process.env.CSP_REPORT_URI || 'https://ourarabheritage.report-uri.com/r/d/csp/enforce'
  };
`.replace(/\n/g, ' ').trim();

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: true,

  generateBuildId: async () => crypto.randomBytes(16).toString('hex'),

  images: {
    domains: [
      'ourarabheritage.com',
      'res.cloudinary.com', 
      'via.placeholder.com',
      'js.stripe.com'
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|security.txt).*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'Report-To',
            value: JSON.stringify({
              group: 'csp',
              max_age: 10886400,
              endpoints: [{ url: process.env.CSP_REPORT_URI }],
              include_subdomains: true
            }),
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
