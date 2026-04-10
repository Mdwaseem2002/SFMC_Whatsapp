/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Server Components (default in Next.js 13+)
  reactStrictMode: true,
  
  // Images configuration
  images: {
    domains: [
      'localhost', // For development
      'api.whatsapp.com', // For WhatsApp profile images
    ],
  },
  
  // Environment variables that will be available to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // API and webhook endpoints should be serverless functions
  async headers() {
    return [
      {
        // SFMC Journey Builder needs CORS + iframe access for custom activities
        source: '/jb-activity/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.exacttarget.com https://*.marketingcloudapps.com https://*.salesforce.com" },
        ],
      },
      {
        // SFMC also calls the JB API routes cross-origin
        source: '/api/jb/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Allow SFMC to call send-whatsapp cross-origin (JB execute endpoint)
        source: '/api/send-whatsapp',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        // Allow SFMC to fetch templates cross-origin (for activity config UI)
        source: '/api/templates',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        // General security headers for all other routes
        source: '/((?!jb-activity|api/jb|api/send-whatsapp|api/templates).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;