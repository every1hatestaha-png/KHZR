import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * KHZR seed — local development only.
 *
 * This seed is intentionally minimal and non-destructive:
 *  - It refuses to run against a production database.
 *  - It never deletes rows. There is no catalogue seeding here; the live
 *    catalogue is managed through the admin product importer.
 *  - It only ensures the launch collection slugs referenced by navigation
 *    exist, so a fresh local database resolves the expected collection URLs.
 */
async function main() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"

  if (isProduction) {
    throw new Error(
      "KHZR seeding is for local development only and will not run against production."
    )
  }

  console.log("Ensuring KHZR launch collections…")

  const collections = [
    {
      slug: "new-arrivals",
      name: "New Arrivals",
      description: "The latest KHZR ready-to-wear eastern dresses for women in Pakistan.",
      isFeatured: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
    {
      slug: "ready-to-wear",
      name: "Ready to Wear",
      description: "KHZR ready-to-wear eastern dresses in a launch price range.",
      isFeatured: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  ]

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: {},
      create: collection,
    })
  }

  const stats = {
    collections: await prisma.collection.count(),
  }
  console.log("Seed complete:", JSON.stringify(stats, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
