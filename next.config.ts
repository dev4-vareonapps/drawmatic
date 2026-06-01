import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mongoose', 'bcryptjs'],
};

export default nextConfig;
