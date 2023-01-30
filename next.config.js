/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["image.tmdb.org", "picsum.photos"],
  },
};

module.exports = nextConfig;
