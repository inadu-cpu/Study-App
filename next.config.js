/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Replace 'study-app' with your actual GitHub repo name
  basePath: process.env.NODE_ENV === 'production' ? '/study-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/study-app/' : '',
}

module.exports = nextConfig
