/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // URL del backend FastAPI. En dev: http://localhost:8000
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

export default nextConfig;
