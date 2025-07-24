export { auth as middleware } from "../auth";

export const config = {
  matcher: [
    // Match all paths except the root and login
    '/((?!$|login).*)',
  ],
};