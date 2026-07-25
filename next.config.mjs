/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["playwright"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
};

export default nextConfig;
