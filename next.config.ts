import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   // Make sure NEXT_PUBLIC_ variables are available during build time if needed
   // Note: Environment variables with NEXT_PUBLIC_ prefix are automatically available client-side
   // This section is usually for server-side only variables needed during build
   env: {
    // Example: If you had a server-only variable needed during build
    // MY_SERVER_VAR: process.env.MY_SERVER_VAR,
   },
};

export default nextConfig;
