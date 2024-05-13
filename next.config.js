/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SWAP_API_BASE_URL: process.env.SWAP_API_BASE_URL,
  },
};

module.exports = nextConfig;
