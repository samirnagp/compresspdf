/** @type {import('next').NextConfig} */
export default {
  output: 'standalone',
  experimental: { serverComponentsExternalPackages: ['sharp'] },
  webpack: (config) => { config.resolve.alias.canvas = false; return config; },
};
