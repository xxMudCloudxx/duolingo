import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 使用 createRouteMatcher 定义公共路由
const isPublicRoute = createRouteMatcher([
  "/",
  // 如果想让其他页面公开，可以加在这里，例如：
  // '/',
  // '/sign-in(.*)',
  // '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 如果当前请求的路由不是公开的，则执行保护逻辑
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
