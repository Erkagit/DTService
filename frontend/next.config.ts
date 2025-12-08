import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'standalone', // Only for Docker deployment
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
