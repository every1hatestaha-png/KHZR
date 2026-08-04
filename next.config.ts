import type { NextConfig } from "next"

/**
 * Production auth-critical environment audit. Runs only during `next build`
 * (NODE_ENV === "production") and only warns, so a build never fails on a
 * missing owner/admin variable — but the Vercel build log will name exactly
 * which variables must be set for the owner to receive admin access.
 */
function auditAuthEnvironment() {
  if (process.env.NODE_ENV !== "production") return
  const required = [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "KHZR_ADMIN_EMAIL",
  ] as const
  const missing = required.filter((key) => !process.env[key])
  if (missing.length === 0) return
  console.warn(
    `[env] KHZR auth env is incomplete in this build. Missing: ${missing.join(", ")}. ` +
      "Until NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY and KHZR_ADMIN_EMAIL " +
      "are all set in the Vercel environment for this scope, admin access is denied."
  )
}

auditAuthEnvironment()

// Content-Security-Policy for production. Applied only when built for
// production so local development (HMR, eval-based tooling) is unaffected.
// Allow-lists Clerk (auth) and Cloudinary/Unsplash (images). Stays permissive
// on inline scripts because Next.js inlines the app bootstrap.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://accounts.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://img.clerk.com",
  "font-src 'self' data:",
  "connect-src 'self' https://accounts.clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://vitals.vercel-insights.com",
  "frame-src https://accounts.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  headers: async () => {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ]
    if (process.env.NODE_ENV === "production") {
      headers.push({ key: "Content-Security-Policy", value: csp })
      headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" })
    }
    return [
      {
        source: "/(.*)",
        headers,
      },
    ]
  },
}

export default nextConfig
