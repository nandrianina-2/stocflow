import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
};

export default nextConfig;