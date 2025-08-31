import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        try {
          const isLoggedIn = !!token;
          const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
          const isOnAuthPage = ["/signin", "/login", "/register"].includes(req.nextUrl.pathname);
          
          // Redirect authenticated users away from auth pages
          if (isLoggedIn && isOnAuthPage) {
            return true; // Allow access but Next.js will handle redirect in page component
          }
          
          // Protect dashboard routes
          if (isOnDashboard) {
            if (isLoggedIn) return true;
            return false; // Redirect unauthenticated users to login page
          }
          
          return true;
        } catch (error) {
          console.error("[Middleware Error]:", error);
          // In case of error, allow access (fail open)
          return true;
        }
      },
    },
    pages: {
      signIn: "/signin",
      error: "/signin",
    },
  }
);

export const config = {
  // More specific matcher to avoid unnecessary middleware runs
  matcher: [
    "/dashboard/:path*",
    "/signin",
    "/login", 
    "/register"
  ],
};
