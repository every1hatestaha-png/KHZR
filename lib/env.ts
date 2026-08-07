const REQUIRED_PRODUCTION_ENV = [
  "DATABASE_URL",
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
  const adminEmail = process.env.KHZR_ADMIN_EMAIL
  if (adminEmail && !/^\S+@\S+\.\S+$/.test(adminEmail.trim())) {
    invalid.push("KHZR_ADMIN_EMAIL")
  }
  const notificationEmail = process.env.KHZR_ORDER_NOTIFICATION_EMAIL
  if (notificationEmail && !/^\S+@\S+\.\S+$/.test(notificationEmail.trim())) {
    invalid.push("KHZR_ORDER_NOTIFICATION_EMAIL")
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
