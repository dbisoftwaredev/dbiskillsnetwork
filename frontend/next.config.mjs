/** @type {import('next').NextConfig} */
const config = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://127.0.0.1:3001/api/:path*' }];
  },
  poweredByHeader: false,
};
export default config;
