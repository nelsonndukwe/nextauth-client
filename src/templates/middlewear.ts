export const writeMiddleware = (version: string) => {
  return version === "V5"
    ? `
  // middleware.ts
  export { auth as middleware } from "@/auth"
  
  // Optionally, don't invoke Middleware on some paths
  // Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  
  
  // ✅ Optional matcher if you only want to protect specific routes
  export const config = {
    matcher: ["/dashboard/:path*", "/settings/:path*"],
  };
  `
    : `
  export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/*/:path*",
  ],
};

  `;
};
