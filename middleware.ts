export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/organizations/:path*',
    '/api/diagrams/:path*',
    '/api/projects/:path*',
  ],
};
