/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS || false;
const basePath = process.env.BASE_PATH || (isGithubPages ? '/UL' : '');

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: isGithubPages ? 'export' : undefined,
  basePath: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'commondatastorage.googleapis.com' },
    ],
  },
};

export default nextConfig;
