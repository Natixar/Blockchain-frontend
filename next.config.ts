import type { NextConfig } from 'next';
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist({
    poweredByHeader: false,
    output: 'standalone',
    experimental: {
      taint: true,
      typedRoutes: true,
    },
} as NextConfig);