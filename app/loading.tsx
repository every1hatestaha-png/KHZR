export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[60vh] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden
          className="animate-pulse font-display text-2xl tracking-[0.5em] text-noir/40 motion-reduce:animate-none"
        >
          KHZR
        </span>
        <span className="h-px w-24 animate-pulse bg-champagne/60 motion-reduce:animate-none" />
      </div>
    </div>
  )
}
