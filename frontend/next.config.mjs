/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  // Xóa phần experimental cũ nếu bị báo lỗi
}

export default nextConfig
