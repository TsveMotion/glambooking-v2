/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
  // Allow dev origins for subdomains
  allowedDevOrigins: [
    'test5.localhost:3000',
    'admin.localhost:3000',
    'localhost:3000'
  ],
  // Disable type checking and linting during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
