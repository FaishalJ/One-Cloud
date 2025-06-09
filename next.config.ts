/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig:NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "img.freepik.com"
      },
      {
        protocol: 'https',
        hostname: "cdn.pixabay.com"
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com'
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io'
      },
    ],
  },
}

module.exports = nextConfig