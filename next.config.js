/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "media.kitsu.io" },
      { protocol: "https", hostname: "img.anili.st" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.RAILWAY_API_URL || "http://localhost:3001"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
