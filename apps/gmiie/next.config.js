/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@xxxiii/ui", "@xxxiii/config", "@xxxiii/seo", "@xxxiii/types"],
  outputFileTracingIncludes: {
    "/api/**": [
      "../../node_modules/.prisma/client/**",
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/**",
    ],
  },
};

module.exports = nextConfig;
