import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

/* ── Imagery helpers (Unsplash CDN until Cloudinary is configured) ── */
const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

const I = {
  hero: "1515886657613-9f3515b0c78f",
  street: "1509631179647-0177331693ae",
  editorial: "1490481651871-ab68de25d43d",
  shirts: "1521577352947-9bb58764b69a",
  rail: "1434389677669-e08b4cac3105",
  store: "1445205170230-053b83016050",
  flatlay: "1467043237213-65f2da53396f",
  portrait: "1496747611176-843222e1e57c",
  lookbook: "1529139574466-a303027c1d8b",
  coat: "1537832816519-689ad163238b",
  knit: "1517841905240-472988babdf9",
  mono: "1503341504253-dff4815485f1",
  shopping: "1483985988355-763728e1935b",
  hat: "1487222477894-8943e31ef7b2",
  light: "1469334031218-e382a71b716b",
  indigo: "1558769132-cb1aea458c5e",
  dress: "1490114538077-0a7f8cb49891",
  coat2: "1515372039744-b8f02a3ae446",
  rack: "1485968579580-b6d095142e6e",
}

/* ── Colourways ── */
const COLORS = {
  Noir: "#121110",
  Oat: "#d9cebd",
  Ivory: "#f3eee6",
  Champagne: "#c2a878",
  Sand: "#e4dccd",
  Stone: "#5c5248",
} as const

const APP_SIZES = ["XS", "S", "M", "L", "XL"]
const SHOE_SIZES = ["35", "36", "37", "38", "39", "40"]

function variants(
  prefix: string,
  colorways: [keyof typeof COLORS, keyof typeof COLORS],
  sizes: string[],
  stockPlan: number[]
) {
  const colors = colorways.map((c) => ({
    color: c,
    colorHex: COLORS[c],
  }))
  let stockIdx = 0
  const list: Prisma.ProductVariantCreateWithoutProductInput[] = []
  for (const { color, colorHex } of colors) {
    for (const size of sizes) {
      list.push({
        size,
        color,
        colorHex,
        sku: `${prefix}-${color.toUpperCase().slice(0, 4)}-${size.toUpperCase()}`,
        stock: stockPlan[stockIdx % stockPlan.length],
        active: true,
      })
      stockIdx++
    }
  }
  return list
}

function product(
  data: {
    name: string
    slug: string
    subtitle: string
    description: string
    composition: string
    care: string
    price: string
    compareAtPrice?: string
    collection: string
    position: number
    colors: [keyof typeof COLORS, keyof typeof COLORS]
    sizes: string[]
    media: [string, string?, string?]
    alt: string
    sku: string
    stockPlan: number[]
    isNew?: boolean
    isFeatured?: boolean
    stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER"
    seoTitle?: string
    seoDescription?: string
  }
): Prisma.ProductCreateInput {
  const { media } = data
  return {
    name: data.name,
    slug: data.slug,
    subtitle: data.subtitle,
    description: data.description,
    composition: data.composition,
    care: data.care,
    price: new Prisma.Decimal(data.price),
    compareAtPrice: data.compareAtPrice
      ? new Prisma.Decimal(data.compareAtPrice)
      : null,
    sku: data.sku,
    isNew: data.isNew ?? false,
    isFeatured: data.isFeatured ?? false,
    stockStatus: data.stockStatus ?? "IN_STOCK",
    status: "ACTIVE",
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    collections: {
      create: [{ collection: { connect: { slug: data.collection } }, position: data.position }],
    },
    variants: {
      create: variants(data.sku, data.colors, data.sizes, data.stockPlan),
    },
    media: {
      create: media
        .filter((m): m is string => Boolean(m))
        .map((id, i) => ({
          publicId: `unsplash-${id}`,
          url: img(id),
          alt: data.alt,
          position: i,
        })),
    },
  }
}

async function main() {
  console.log("Seeding KHZR editorial catalogue…")

  // ── Reset in dependency order ────────────────────────────────
  await prisma.campaignCollection.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.lookbookEntry.deleteMany()
  await prisma.lookbook.deleteMany()
  await prisma.journalPost.deleteMany()
  await prisma.review.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.productCollection.deleteMany()
  await prisma.productMedia.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.user.deleteMany()

  // ── Collections ──────────────────────────────────────────────
  const collections: Prisma.CollectionCreateManyInput[] = [
    {
      slug: "tailoring",
      name: "The Tailoring Room",
      description:
        "Architectural cuts and double-faced cloth. Garments built around the body with a couture pattern archive.",
      editorial:
        "The tailoring room is the heart of the maison. Here seams are pressed by hand, canvases are floated,\nand each garment is built to hold its silhouette for decades. Every piece in this room is cut from\nfulling-needle wool or virgin wool twill, and finished with horn buttons sourced from a single\nthird-generation atelier in Lombardy.",
      imageUrl: img(I.coat),
      isFeatured: true,
      sortOrder: 1,
      publishedAt: new Date("2026-01-10"),
      seoTitle: "The Tailoring Room — KHZR",
      seoDescription:
        "Architectural coats, suits and trousers cut from double-faced cloth by the KHZR tailoring room.",
    },
    {
      slug: "essentials",
      name: "Crafted Essentials",
      description:
        "The permanent wardrobe: silk-twill shirting, cashmere roll-necks and leather goods worn daily.",
      editorial:
        "Essentials are not afterthoughts. They are the pieces that survive trends — knitted from\nMongolian cashmere, woven from mulberry silk, tanned over thirty days. We call this room\nthe permanent collection because nothing in it is ever retired.",
      imageUrl: img(I.knit),
      isFeatured: true,
      sortOrder: 2,
      publishedAt: new Date("2026-01-12"),
      seoTitle: "Crafted Essentials — KHZR",
      seoDescription:
        "The permanent wardrobe: cashmere knits, silk-twill shirts and hand-finished leather goods.",
    },
    {
      slug: "evening",
      name: "The Evening Atelier",
      description:
        "Gowns in silk charmeuse and duchesse satin, cut for the hour between dusk and midnight.",
      editorial:
        "The evening atelier works to a slower calendar. Each gown is draped on a live mannequin,\nheld by a single assistant, and finished with invisible seams. No two are ever identical.",
      imageUrl: img(I.dress),
      isFeatured: true,
      sortOrder: 3,
      publishedAt: new Date("2026-01-15"),
      seoTitle: "The Evening Atelier — KHZR",
      seoDescription:
        "Evening gowns in silk charmeuse and duchesse satin, draped by hand in the KHZR atelier.",
    },
    {
      slug: "archive",
      name: "Atelier Archive",
      description:
        "Limited pieces from past ateliers, reissued in small numbers. Numbered, never repeated.",
      editorial:
        "The archive reissues a single silhouette each season — the piece our clients wrote to us about\nfor years. Each is numbered by hand and produced in a limited run.",
      imageUrl: img(I.rack),
      isFeatured: false,
      sortOrder: 4,
      publishedAt: new Date("2026-02-01"),
      seoTitle: "Atelier Archive — KHZR",
      seoDescription:
        "Numbered, limited reissues of archival KHZR silhouettes. Never repeated.",
    },
  ]
  await prisma.collection.createMany({ data: collections })

  // ── Products ─────────────────────────────────────────────────
  const products: Prisma.ProductCreateInput[] = [
    product({
      name: "The Slate Wool Overcoat",
      slug: "slate-wool-overcoat",
      subtitle: "Fulling-needle wool, cut long and clean",
      description:
        "A single-button overcoat cut from fulling-needle wool with a canvas chest floated by hand. The sleeve head is softly rounded; the silhouette falls from the shoulder without a single interrupting seam across the back. Finished with horn buttons and a deep throat latch.",
      composition: "100% virgin wool · horn buttons · cupro lining",
      care: "Dry clean only. Hang on a broad-shouldered hanger.",
      price: "1850.00",
      collection: "tailoring",
      position: 1,
      colors: ["Noir", "Oat"],
      sizes: APP_SIZES,
      media: [I.coat2, I.coat, I.mono],
      alt: "The Slate Wool Overcoat in matte wool",
      sku: "KHZR-COAT-SLATE",
      stockPlan: [12, 8, 20, 5, 14, 9, 11, 3, 16, 7],
      isNew: true,
      seoTitle: "The Slate Wool Overcoat — KHZR",
      seoDescription:
        "Single-button overcoat in fulling-needle wool, floated canvas chest and horn buttons.",
    }),
    product({
      name: "Structured Oversized Blazer",
      slug: "structured-oversized-blazer",
      subtitle: "Soft construction, decisive shoulder",
      description:
        "An oversized blazer with a softly padded shoulder and a straight, un-pinched waist. Cut from wool twill with a half-canvas front — tailored enough to hold, loose enough to live in.",
      composition: "98% wool · 2% elastane · viscose lining",
      care: "Dry clean only.",
      price: "1240.00",
      collection: "tailoring",
      position: 2,
      colors: ["Noir", "Stone"],
      sizes: APP_SIZES,
      media: [I.coat, I.mono, I.rail],
      alt: "Structured oversized blazer in wool twill",
      sku: "KHZR-BLAZER-STRUCT",
      stockPlan: [6, 10, 18, 4, 9, 12, 7, 15, 2, 8],
      seoTitle: "Structured Oversized Blazer — KHZR",
      seoDescription:
        "Half-canvas oversized blazer in wool twill with a decisive, softly padded shoulder.",
    }),
    product({
      name: "Double-Faced Tailored Trousers",
      slug: "double-faced-tailored-trousers",
      subtitle: "Flat front, clean break",
      description:
        "Double-faced wool trousers cut with a flat front and a single pressed crease. The waistband is finished with a grosgrain facing; hems are left unsewn for personal adjustment at our ateliers.",
      composition: "100% double-faced wool",
      care: "Dry clean only. Steam rather than press.",
      price: "620.00",
      collection: "tailoring",
      position: 3,
      colors: ["Oat", "Noir"],
      sizes: APP_SIZES,
      media: [I.rail, I.flatlay],
      alt: "Double-faced tailored trousers in oat wool",
      sku: "KHZR-TROU-DOUBLE",
      stockPlan: [14, 9, 22, 6, 11, 13, 8, 17, 4, 10],
      seoTitle: "Double-Faced Tailored Trousers — KHZR",
      seoDescription:
        "Flat-front trousers in double-faced wool with a clean break and grosgrain facing.",
    }),
    product({
      name: "Hand-Finished Trench Coat",
      slug: "hand-finished-trench-coat",
      subtitle: "Balmacaan lines, English cotton gabardine",
      description:
        "A trench cut on Balmacaan lines from dense cotton gabardine. Raglan shoulder, horn storm flap, and a fly front that closes on concealed buttons. The belt is cut on the bias and lies flat against the waist.",
      composition: "100% cotton gabardine · horn buttons",
      care: "Dry clean only.",
      price: "1590.00",
      collection: "tailoring",
      position: 4,
      colors: ["Sand", "Oat"],
      sizes: APP_SIZES,
      media: [I.editorial, I.street, I.mono],
      alt: "Hand-finished trench coat in sand gabardine",
      sku: "KHZR-TRENCH-HAND",
      stockPlan: [9, 12, 16, 5, 10, 14, 7, 11, 3, 6],
      isFeatured: true,
      seoTitle: "Hand-Finished Trench Coat — KHZR",
      seoDescription:
        "Balmacaan-line trench in dense cotton gabardine with raglan shoulder and fly front.",
    }),
    product({
      name: "Pinstriped Peak-Lapel Suit",
      slug: "pinstriped-peak-lapel-suit",
      subtitle: "Two pieces, one drawing",
      description:
        "A two-piece suit in fine pinstriped wool with a peak lapel and a gently extended shoulder. Trousers cut with a double pleat and a fuller leg. Made in our atelier to be worn as a single drawing.",
      composition: "100% wool · cupro lining",
      care: "Dry clean only.",
      price: "2100.00",
      collection: "tailoring",
      position: 5,
      colors: ["Noir", "Stone"],
      sizes: APP_SIZES,
      media: [I.mono, I.coat, I.portrait],
      alt: "Pinstriped peak-lapel suit in wool",
      sku: "KHZR-SUIT-PEAK",
      stockPlan: [5, 7, 12, 4, 8, 9, 6, 10, 2, 5],
      isFeatured: true,
      seoTitle: "Pinstriped Peak-Lapel Suit — KHZR",
      seoDescription:
        "Two-piece pinstriped suit with peak lapel, extended shoulder and double-pleated trouser.",
    }),
    product({
      name: "Ivory Silk-Twill Shirt",
      slug: "ivory-silk-twill-shirt",
      subtitle: "Mulberry silk, mother-of-pearl buttons",
      description:
        "A shirting in mulberry silk twill with a camp collar and mother-of-pearl buttons. The hem falls long enough to wear untucked; the sleeve is cut from a single piece of cloth.",
      composition: "100% mulberry silk",
      care: "Hand wash cold. Do not tumble dry.",
      price: "390.00",
      collection: "essentials",
      position: 1,
      colors: ["Ivory", "Oat"],
      sizes: APP_SIZES,
      media: [I.shirts, I.flatlay],
      alt: "Ivory silk-twill shirt with mother-of-pearl buttons",
      sku: "KHZR-SHIRT-IVORY",
      stockPlan: [18, 12, 24, 8, 15, 20, 10, 16, 6, 12],
      isNew: true,
      seoTitle: "Ivory Silk-Twill Shirt — KHZR",
      seoDescription:
        "Mulberry silk-twill shirt with camp collar and mother-of-pearl buttons.",
    }),
    product({
      name: "Cashmere Roll-Neck Sweater",
      slug: "cashmere-roll-neck-sweater",
      subtitle: "Two-ply Mongolian cashmere",
      description:
        "A roll-neck in two-ply Mongolian cashmere, knitted on a fine gauge and washed until it drapes. Ribbed at the hem and cuffs, and cut with a slightly dropped shoulder for an unconstructed ease.",
      composition: "100% Mongolian cashmere",
      care: "Hand wash in cold water with wool wash. Dry flat.",
      price: "780.00",
      compareAtPrice: "890.00",
      collection: "essentials",
      position: 2,
      colors: ["Oat", "Noir"],
      sizes: APP_SIZES,
      media: [I.knit, I.portrait],
      alt: "Cashmere roll-neck sweater in oat",
      sku: "KHZR-KNIT-ROLLNECK",
      stockPlan: [10, 14, 20, 7, 12, 16, 9, 13, 4, 8],
      isFeatured: true,
      isNew: true,
      seoTitle: "Cashmere Roll-Neck Sweater — KHZR",
      seoDescription:
        "Two-ply Mongolian cashmere roll-neck, fine-gauge knit with a dropped shoulder.",
    }),
    product({
      name: "Knitted Silk Shell",
      slug: "knitted-silk-shell",
      subtitle: "A second skin in silk",
      description:
        "A knitted shell in silk that follows the body without announcing it. Ribbed throughout, with a narrow neckline that stays in place. Worn under tailoring or alone.",
      composition: "100% silk",
      care: "Hand wash cold. Dry flat.",
      price: "340.00",
      collection: "essentials",
      position: 3,
      colors: ["Ivory", "Champagne"],
      sizes: APP_SIZES,
      media: [I.flatlay, I.shirts],
      alt: "Knitted silk shell in ivory",
      sku: "KHZR-SHELL-SILK",
      stockPlan: [15, 10, 19, 6, 13, 17, 8, 14, 5, 9],
      seoTitle: "Knitted Silk Shell — KHZR",
      seoDescription:
        "A ribbed silk shell, cut as a second skin for wearing beneath tailoring.",
    }),
    product({
      name: "Leather Slide Sandal",
      slug: "leather-slide-sandal",
      subtitle: "Vegetable-tanned leather, hand-stitched",
      description:
        "A slide in vegetable-tanned leather with a sculpted cork-and-leather sole. The strap is cut from a single hide and stitched by hand. Worn in, the leather deepens to a personal patina.",
      composition: "Vegetable-tanned calf leather · cork sole",
      care: "Wipe clean. Avoid prolonged water exposure.",
      price: "450.00",
      collection: "essentials",
      position: 4,
      colors: ["Stone", "Noir"],
      sizes: SHOE_SIZES,
      media: [I.store, I.flatlay],
      alt: "Leather slide sandal in stone",
      sku: "KHZR-SLIDE-LEATHER",
      stockPlan: [11, 8, 14, 5, 9, 12, 7, 10, 4, 6],
      seoTitle: "Leather Slide Sandal — KHZR",
      seoDescription:
        "Hand-stitched vegetable-tanned leather slide with a sculpted cork sole.",
    }),
    product({
      name: "Column Evening Dress",
      slug: "column-evening-dress",
      subtitle: "Silk charmeuse, cut on the bias",
      description:
        "A column dress in silk charmeuse cut entirely on the bias so it falls in a single liquid line. The neckline is traced with a hand-rolled edge; the back closes on a concealed zip.",
      composition: "100% silk charmeuse",
      care: "Dry clean only.",
      price: "2400.00",
      collection: "evening",
      position: 1,
      colors: ["Noir", "Champagne"],
      sizes: APP_SIZES,
      media: [I.dress, I.light, I.hat],
      alt: "Column evening dress in noir silk charmeuse",
      sku: "KHZR-DRESS-COLUMN",
      stockPlan: [4, 6, 9, 3, 5, 7, 4, 8, 2, 5],
      isFeatured: true,
      seoTitle: "Column Evening Dress — KHZR",
      seoDescription:
        "Bias-cut column dress in silk charmeuse with a hand-rolled neckline.",
    }),
    product({
      name: "Silk Charmeuse Gown",
      slug: "silk-charmeuse-gown",
      subtitle: "Draped in the evening atelier",
      description:
        "A floor-length gown draped on a live mannequin and finished with invisible seams. The bodice is held by a single silk strap; the skirt pools from a low hip seam.",
      composition: "100% silk charmeuse",
      care: "Dry clean only.",
      price: "2950.00",
      collection: "evening",
      position: 2,
      colors: ["Champagne", "Ivory"],
      sizes: APP_SIZES,
      media: [I.light, I.dress, I.editorial],
      alt: "Silk charmeuse gown in champagne",
      sku: "KHZR-GOWN-CHARM",
      stockPlan: [2, 3, 5, 2, 4, 3, 6, 2, 1, 3],
      isNew: true,
      stockStatus: "LOW_STOCK",
      seoTitle: "Silk Charmeuse Gown — KHZR",
      seoDescription:
        "Hand-draped silk charmeuse gown with invisible seams and a single strap.",
    }),
    product({
      name: "Archival Long-Line Vest",
      slug: "archival-long-line-vest",
      subtitle: "Reissued, numbered, limited",
      description:
        "A reissue from the 1996 atelier — a long-line vest cut from double-faced wool with a high, notched neck. Each piece is numbered by hand and produced in a limited run of one hundred.",
      composition: "100% double-faced wool · cupro lining",
      care: "Dry clean only.",
      price: "890.00",
      collection: "archive",
      position: 1,
      colors: ["Noir", "Oat"],
      sizes: APP_SIZES,
      media: [I.rack, I.mono],
      alt: "Archival long-line vest in noir double-faced wool",
      sku: "KHZR-ARCHIVE-VEST",
      stockPlan: [3, 2, 5, 1, 3, 4, 2, 5, 1, 2],
      stockStatus: "OUT_OF_STOCK",
      seoTitle: "Archival Long-Line Vest — KHZR",
      seoDescription:
        "Numbered reissue of the 1996 long-line vest in double-faced wool. Limited to one hundred.",
    }),
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }

  // ── Campaigns (homepage editorial) ───────────────────────────
  await prisma.campaign.create({
    data: {
      name: "Silhouettes in Monochrome",
      kicker: "Autumn — Winter MMXXVI",
      title: "Silhouettes in Monochrome",
      subtitle:
        "A study in restraint — double-faced wool, bias-cut silk and the discipline of a single colour field.",
      ctaLabel: "Explore the Collection",
      ctaHref: "/collections",
      imageUrl: img(I.hero, 2400),
      position: 1,
      isActive: true,
      collections: {
        create: [
          { collection: { connect: { slug: "tailoring" } } },
          { collection: { connect: { slug: "evening" } } },
        ],
      },
    },
  })

  await prisma.campaign.create({
    data: {
      name: "The Art of Quiet",
      kicker: "The Maison",
      title: "The Art of Quiet",
      subtitle:
        "What we leave out is as deliberate as what we cut. On the grammar of quiet luxury.",
      ctaLabel: "Read the Journal",
      ctaHref: "/journal/the-art-of-quiet",
      imageUrl: img(I.mono, 2000),
      position: 2,
      isActive: true,
    },
  })

  await prisma.campaign.create({
    data: {
      name: "Dressed in Light",
      kicker: "The Evening Atelier",
      title: "Dressed in Light",
      subtitle:
        "Champagne silk, hand-rolled edges and the hour between dusk and midnight.",
      ctaLabel: "The Evening Atelier",
      ctaHref: "/collection/evening",
      imageUrl: img(I.light, 2000),
      position: 3,
      isActive: true,
      collections: {
        create: [{ collection: { connect: { slug: "evening" } } }],
      },
    },
  })

  // ── Journal ──────────────────────────────────────────────────
  await prisma.journalPost.create({
    data: {
      slug: "the-art-of-quiet",
      title: "The Art of Quiet",
      excerpt:
        "On the grammar of quiet luxury: proportion, restraint, and the things we choose not to say.",
      author: "The Editorial Office",
      coverImage: img(I.mono, 2000),
      publishedAt: new Date("2026-02-03"),
      seoTitle: "The Art of Quiet — KHZR Journal",
      seoDescription:
        "KHZR on the grammar of quiet luxury: proportion, restraint and what we leave out.",
      body: `Quiet luxury is not a colour or a fabric. It is a discipline of omission.

We begin a garment by deciding what it will not be. The overcoat will not be shortened
to flatter a trend. The trouser will not be tapered to chase a season. The gown will
not be embellished to hold attention — it will hold attention by refusing to.

Proportion does the work that ornament once did. A shoulder that drops four centimetres
and no more. A lapel whose gorge is set half a centimetre lower, so the eye travels
downward. These are decisions you feel before you see.

And then there is colour. We work in a single field — oat, ivory, sand, stone and noir —
because colour, like everything else, is best when it is chosen once and held.

The result is not minimalism. Minimalism is an aesthetic position. Quiet luxury is a
craft position: it assumes you will live with the piece long enough to notice how well
it was made.`,
    },
  })

  await prisma.journalPost.create({
    data: {
      slug: "notes-on-the-double-faced-overcoat",
      title: "Notes on the Double-Faced Overcoat",
      excerpt:
        "Seams pressed open, edges bound in their own cloth — how a coat is built to hold its silhouette for decades.",
      author: "The Atelier",
      coverImage: img(I.coat2, 2000),
      publishedAt: new Date("2026-01-22"),
      seoTitle: "Notes on the Double-Faced Overcoat — KHZR",
      seoDescription:
        "How the KHZR atelier builds a double-faced overcoat that holds its silhouette for decades.",
      body: `A double-faced garment is two cloths, woven as one, and joined so that no seam is ever
visible. The technique is slow and unforgiving.

Each panel is cut from the full width of the cloth. Edges are trimmed, opened, and bound
back into their own fabric — so the inside of the coat is finished exactly as the outside.
A machine cannot do this; the needle must be guided by hand, and the tension must not vary
by more than a thread's width across the length of a seam.

The canvas chest is floated, not glued. Horn buttons are shanked, not riveted. The sleeve
head is eased so that no more than two millimetres of fullness collects at the crown —
enough to round the shoulder, never enough to distort the line.

We estimate the double-faced overcoat at one hundred and forty hours of handwork. We have
never found a way to make it faster that did not also make it worse.`,
    },
  })

  await prisma.journalPost.create({
    data: {
      slug: "a-season-in-neutrals",
      title: "A Season in Neutrals",
      excerpt:
        "Oat, ivory, sand, stone and noir — a field guide to wearing a restricted palette without fading into it.",
      author: "The Editorial Office",
      coverImage: img(I.hero, 2000),
      publishedAt: new Date("2026-02-12"),
      seoTitle: "A Season in Neutrals — KHZR Journal",
      seoDescription:
        "A field guide to wearing a restricted palette of oat, ivory, sand, stone and noir.",
      body: `A restricted palette only works if it is truly restricted. The discipline is in the refusal.

Choose one ground colour per outfit — oat in the morning, noir in the evening. Everything
else is support. The ground colour decides the temperature of the light you are in.

Texture replaces contrast. When colour does not vary, the eye reads surface: a roll-neck
in two-ply cashmere against trousers in double-faced wool, a silk shell beneath a floated
canvas chest. Dress in one colour, and texture becomes your ornament.

Ivory reads whiter near sand, warmer near champagne. Keep one metallic in the palette —
a single gold hairline — and use it as a full stop, not a sentence.

And finally: neutrals reward better cloth. Cheap wool in a neutral palette reads as grey.
Good wool reads as light. The garment is the colour.`,
    },
  })

  // ── Lookbook ─────────────────────────────────────────────────
  const collectionProducts = await prisma.product.findMany({
    select: { id: true, slug: true },
  })
  const find = (slug: string) =>
    collectionProducts.find((p) => p.slug === slug)?.id ?? ""

  await prisma.lookbook.create({
    data: {
      slug: "monochrome-studies",
      title: "Monochrome Studies",
      description:
        "A campaign series — silhouettes in a single field of colour.",
      coverImage: img(I.mono, 2000),
      publishedAt: new Date("2026-02-01"),
      entries: {
        create: [
          {
            productId: find("slate-wool-overcoat"),
            imageUrl: img(I.coat2, 1800),
            caption: "The Slate Wool Overcoat, single-button",
            position: 1,
          },
          {
            productId: find("structured-oversized-blazer"),
            imageUrl: img(I.coat, 1800),
            caption: "Structured Oversized Blazer, floated canvas",
            position: 2,
          },
          {
            productId: find("hand-finished-trench-coat"),
            imageUrl: img(I.street, 1800),
            caption: "Hand-Finished Trench Coat in sand gabardine",
            position: 3,
          },
          {
            productId: find("column-evening-dress"),
            imageUrl: img(I.dress, 1800),
            caption: "Column Evening Dress, bias-cut charmeuse",
            position: 4,
          },
          {
            productId: find("pinstriped-peak-lapel-suit"),
            imageUrl: img(I.portrait, 1800),
            caption: "Pinstriped Peak-Lapel Suit",
            position: 5,
          },
        ],
      },
    },
  })

  await prisma.lookbook.create({
    data: {
      slug: "tailoring-in-motion",
      title: "Tailoring in Motion",
      description:
        "The tailoring room, photographed on the street rather than the stand.",
      coverImage: img(I.editorial, 2000),
      publishedAt: new Date("2026-02-14"),
      entries: {
        create: [
          {
            productId: find("hand-finished-trench-coat"),
            imageUrl: img(I.editorial, 1800),
            caption: "Balmacaan lines, worn open",
            position: 1,
          },
          {
            productId: find("ivory-silk-twill-shirt"),
            imageUrl: img(I.shirts, 1800),
            caption: "Silk-twill shirt, untucked",
            position: 2,
          },
          {
            productId: find("double-faced-tailored-trousers"),
            imageUrl: img(I.rail, 1800),
            caption: "Double-faced trouser, single crease",
            position: 3,
          },
          {
            productId: find("leather-slide-sandal"),
            imageUrl: img(I.store, 1800),
            caption: "Vegetable-tanned slide",
            position: 4,
          },
        ],
      },
    },
  })

  const stats = {
    collections: await prisma.collection.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    media: await prisma.productMedia.count(),
    campaigns: await prisma.campaign.count(),
    journal: await prisma.journalPost.count(),
    lookbooks: await prisma.lookbook.count(),
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
