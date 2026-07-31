import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
)

const isProtectedRoute = createRouteMatcher(["/account(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

const withAuth = clerkMiddleware(async (auth, req) => {
  const session = await auth()
  const { userId } = session

  if (!userId && (isProtectedRoute(req) || isAdminRoute(req))) {
    return session.redirectToSignIn({ returnBackUrl: req.url })
  }

  if (isAdminRoute(req)) {
    const role = (
      session.sessionClaims?.metadata as { role?: string } | undefined
    )?.role
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
})

export default clerkConfigured
  ? withAuth
  : () => NextResponse.next()

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless in _next/image
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
