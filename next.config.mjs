if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["slate-editor", "@slate-editor/color-plugin"],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  i18n: {
    locales: ["en", "vi","cn"],
    defaultLocale: "en",
    localeDetection: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [325,640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  async rewrites() {
    return [
      {
        source: `${process.env.NEXT_PUBLIC_API_BASE}/:path*`,
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },  
    ];
  },
};

export default nextConfig;
