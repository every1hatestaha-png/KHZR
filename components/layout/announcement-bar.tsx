import { getAnnouncementSettings } from "@/lib/data-access/site"

export async function AnnouncementBar() {
  const announcement = await getAnnouncementSettings()
  if (!announcement.active) return null
  return (
    <div className="relative overflow-hidden bg-noir py-2.5">
      <div
        className="flex items-center justify-center gap-8 px-4 text-center"
        aria-live="polite"
      >
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-warm-white/90">
          {announcement.text}
        </span>
      </div>
    </div>
  )
}
