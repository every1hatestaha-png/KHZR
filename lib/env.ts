const REQUIRED_PRODUCTION_ENV = [
  "NEXT_PUBLIC_SITE_URL",
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "REVALIDATE_SECRET",
] as const

function missingProductionEnv(): string[] {
  return REQUIRED_PRODUCTION_ENV.filter((key) => !process.env[key])
}

function invalidProductionEnv(): string[] {
  const invalid: string[] = []
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    try {
      const url = new URL(siteUrl)
      if (url.protocol !== "https:") invalid.push("NEXT_PUBLIC_SITE_URL")
    } catch {
      invalid.push("NEXT_PUBLIC_SITE_URL")
    }
  }
  return invalid
}

export function assertProductionEnvironment(): void {
  if (process.env.NODE_ENV !== "production") return

  const missing = missingProductionEnv()
  const invalid = invalidProductionEnv()
  if (missing.length === 0 && invalid.length === 0) return

  const parts = [
    missing.length ? `missing: ${missing.join(", ")}` : "",
    invalid.length ? `invalid: ${invalid.join(", ")}` : "",
  ].filter(Boolean)

  throw new Error(`Invalid production environment (${parts.join("; ")}).`)
}
