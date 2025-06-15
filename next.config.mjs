/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['imiiqiicmywrqixnhagu.supabase.co'], // Replace with your Supabase domain
  },
  // Add transpilePackages for framer-motion to handle "export *" issues
  transpilePackages: ['framer-motion'],
  webpack: (config) => {
    // Handle the export * issue with framer-motion
    config.module.rules.push({
      test: /node_modules\/framer-motion/,
      sideEffects: false,
    });
    return config;
  },  // Expose environment variables to the browser
  env: {
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    NEXT_PUBLIC_ADMIN_PASSWORD_FOR_LOGIN: process.env.ADMIN_PASSWORD_FOR_LOGIN,
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    NEXT_PUBLIC_ADMIN_PASSWORD_FOR_LOGIN: process.env.ADMIN_PASSWORD_FOR_LOGIN,
  },
  // Add your Supabase URL to prevent CORS issues when fetching music
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

// Use dynamic import for the bundle analyzer
let config = nextConfig;

// Enable bundle analyzer in analyze mode
if (process.env.ANALYZE === 'true') {
  // Import needed only in analyze mode
  const bundleAnalyzerPkg = await import('@next/bundle-analyzer');
  const withBundleAnalyzer = bundleAnalyzerPkg.default({
    enabled: true,
  });
  config = withBundleAnalyzer(nextConfig);
}

export default config;
