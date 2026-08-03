export default function SearchLoading() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10" aria-live="polite" aria-busy="true">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.34em] text-taupe">Search</p>
        <div className="mx-auto mt-6 h-10 w-64 bg-ivory" />
        <div className="mx-auto mt-8 h-12 max-w-2xl bg-ivory" />
      </div>
      <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-4">
            <div className="aspect-[2/3] bg-ivory" />
            <div className="h-4 w-3/4 bg-ivory" />
            <div className="h-3 w-1/3 bg-ivory" />
          </div>
        ))}
      </div>
    </section>
  )
}
