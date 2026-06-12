/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qudupihspkxixoceiacs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // imagens geradas pelo Stitch (Google)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
