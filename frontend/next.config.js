// next.config.js
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
  
    env: {
      NEXT_PUBLIC_API_URL: "https://our-arab-heritage-production.up.railway.app",
      NEXT_PUBLIC_SITE_URL: "ourarabheritage.com",
      NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || "development",
    },
  
    images: {
      domains: ["ourarabheritage.com", "res.cloudinary.com"], // Add any domains you use for images
    },
  
    experimental: {
      serverActions: true, // Optional: for future Next.js features
    },
  
    // Optional: Security headers (You can uncomment and adjust)
    /*
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-XSS-Protection", value: "1; mode=block" },
          ],
        },
      ];
    },
    */
  
    // Optional: Redirects (if needed)
    /*
    async redirects() {
      return [
        {
          source: "/legacy-route",
          destination: "/new-route",
          permanent: true,
        },
      ];
    },
    */
  };
  
  module.exports = nextConfig;
  
