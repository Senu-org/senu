/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set the workspace root to silence the lockfile warning
  outputFileTracingRoot: require('path').join(__dirname, '../'),
  
  // PWA configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Headers para PWA y Service Worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Enable HTTPS for development (required for WhatsApp integration)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // API Gateway
      },
    ];
  },
};

module.exports = nextConfig;