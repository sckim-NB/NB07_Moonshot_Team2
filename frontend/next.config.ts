import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', 
    },
  },
  async rewrites() {
    return [
      {
      source: '/api/:path*',
      destination: 'http://localhost:3000/:path*',
    },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
    //   {
    //   source: '/auth/:path*',
    //   destination: 'http://localhost:3000/auth/:path*',
    // },
    // {
    //   source: '/users/:path*',
    //   destination: 'http://localhost:3000/users/:path*',
    // },
    // {
    //   source: '/projects/:path*',
    //   destination: 'http://localhost:3000/projects/:path*',
    // },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/projects',
        permanent: false,
      },
      {
        source: '/projects/:projectId',
        destination: '/projects/:projectId/tasks',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
    ],
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  webpack: (config) => {
    // @ts-expect-error 타입 에러 무시
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              typescript: true,
              ext: 'tsx',
            },
          },
        ],
      }
    );
    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
};

export default nextConfig;
