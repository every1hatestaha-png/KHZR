export type ProductMerchandisingDetails = {
  body: string
  workType: string
  piecesIncluded: string
  sleeveStyle: string
  neckline: string
  season: string
  sizeGuideNotes: string
}

const LABELS = {
  workType: "Work",
  piecesIncluded: "Pieces Included",
  sleeveStyle: "Sleeve Style",
  neckline: "Neckline",
  season: "Season",
  sizeGuideNotes: "Size Guide Notes",
} as const

const LOOKUP = new Map<string, keyof typeof LABELS>([
  ["work", "workType"],
  ["work type", "workType"],
  ["pieces included", "piecesIncluded"],
  ["what is included", "piecesIncluded"],
  ["sleeve style", "sleeveStyle"],
  ["neckline", "neckline"],
  ["season", "season"],
  ["size guide notes", "sizeGuideNotes"],
])

function emptyDetails(): ProductMerchandisingDetails {
  return {
    body: "",
    workType: "",
    piecesIncluded: "",
    sleeveStyle: "",
    neckline: "",
    season: "",
    sizeGuideNotes: "",
  }
}

export function parseProductMerchandising(description: string | null | undefined): ProductMerchandisingDetails {
  const details = emptyDetails()
  const body: string[] = []
  for (const block of (description ?? "").split(/\n{2,}/)) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const match = /^([^:]{2,40}):\s*([\s\S]+)$/.exec(trimmed)
    const key = match ? LOOKUP.get(match[1].trim().toLowerCase()) : null
    if (key) details[key] = match?.[2].trim() ?? ""
    else body.push(trimmed)
  }
  details.body = body.join("\n\n")
  return details
}

export function formatProductMerchandising(input: ProductMerchandisingDetails) {
  const sections = [input.body.trim()]
  for (const [key, label] of Object.entries(LABELS) as Array<[keyof typeof LABELS, string]>) {
    const value = input[key].trim()
    if (value) sections.push(`${label}: ${value}`)
  }
  return sections.filter(Boolean).join("\n\n")
}

export function productMerchandisingRows(input: ProductMerchandisingDetails) {
  return [
    { label: "Work", value: input.workType },
    { label: "Pieces Included", value: input.piecesIncluded },
    { label: "Sleeve Style", value: input.sleeveStyle },
    { label: "Neckline", value: input.neckline },
    { label: "Season", value: input.season },
    { label: "Size Guide", value: input.sizeGuideNotes },
  ].filter((item) => item.value.trim())
}
