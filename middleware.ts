import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse, type NextRequest } from "next/server"

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
)

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

const withAuth = clerkMiddleware(async (auth, req) => {
  const session = await auth()
  const { userId } = session

  if (!userId && isAdminRoute(req)) {
    return session.redirectToSignIn({ returnBackUrl: req.url })
  }

  return NextResponse.next()
})

export default clerkConfigured
  ? withAuth
  : (req: NextRequest) => {
      // Fail closed in production: never expose the admin area without auth.
      if (process.env.NODE_ENV === "production" && isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/sign-in", req.url))
      }
      return NextResponse.next()
    }

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless in _next/image
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
