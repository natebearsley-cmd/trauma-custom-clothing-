/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remote inventory images are rendered unoptimized by Next unless explicitly
    // allowlisted here. Repository images use the built-in optimizer.
    remotePatterns: [{ protocol: 'https', hostname: 'images.depop.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
    ]
  },
}
export default nextConfig
