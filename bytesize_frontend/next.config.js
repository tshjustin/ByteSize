/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // enables Docker support
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;