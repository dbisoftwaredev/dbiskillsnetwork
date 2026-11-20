/** @type {import('next').NextConfig} */
const apiOrigin = (process.env.API_ORIGIN || 'http://127.0.0.1:3001').replace(/\/+$/, '');
const config = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
  poweredByHeader: false,
};
export default config;
