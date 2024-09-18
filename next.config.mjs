// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     poweredByHeader: false,  
// };

// export default nextConfig;


import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist({
    /** @type {import('next').NextConfig} */
    poweredByHeader: false,
    output: 'standalone',
    experimental: {
      taint: true,
      typedRoutes: true,
    },
    // compiler: {
    //   removeConsole: {
    //     exclude: ['error'],
    //   },
    // },
});