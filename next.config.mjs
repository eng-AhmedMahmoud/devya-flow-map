/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // CMS media hosts rendered via next/image (lib/img.ts + user avatars).
    remotePatterns: [
      { protocol: 'https', hostname: 'www.devya.dev' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
    ],
  },
  async rewrites() {
    // Same-origin proxy so the httpOnly devya_session cookie travels with every
    // browser API call (identical pattern to admin-app).
    const upstream = process.env.API_PROXY_TARGET ?? 'https://api.devya-solutions.com';
    return [{ source: '/api/:path*', destination: `${upstream}/api/:path*` }];
  },
};
export default nextConfig;
