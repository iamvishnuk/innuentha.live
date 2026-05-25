/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@innuentha/ui', '@innuentha/supabase'],
  allowedDevOrigins: ['192.168.29.252']
};

export default nextConfig;
