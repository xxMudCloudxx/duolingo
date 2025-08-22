import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 使用 createRouteMatcher 定义公共路由
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 如果当前请求的路由不是公开的，则执行保护逻辑
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// 添加调试信息（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('Clerk middleware loaded with public routes:', [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
  ]);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
