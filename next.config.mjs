/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // Safe subset of CSP that does not interfere with Next.js or AdSense.
  { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'self'" },
];

export default {
  output: 'standalone',
  poweredByHeader: false,
  experimental: { serverComponentsExternalPackages: ['sharp'] },
  webpack: (config) => { config.resolve.alias.canvas = false; return config; },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};
