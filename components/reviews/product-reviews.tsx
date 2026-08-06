"use client"

import * as React from "react"
import type { ReviewSummaryDTO } from "@/lib/data-access/reviews"
import { formatDate } from "@/lib/utils"

type Sort = "newest" | "highest" | "lowest" | "helpful"

export function ProductReviews({ summary }: { summary: ReviewSummaryDTO }) {
  const [sort, setSort] = React.useState<Sort>("newest")
  const reviews = React.useMemo(() => {
    const list = [...summary.reviews]
    if (sort === "highest") return list.sort((a, b) => b.rating - a.rating)
    if (sort === "lowest") return list.sort((a, b) => a.rating - b.rating)
    if (sort === "helpful") return list.sort((a, b) => b.helpfulCount - a.helpfulCount)
    return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }, [summary.reviews, sort])

  return (
    <section className="border-t border-hairline bg-background" id="reviews">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 lg:grid-cols-[360px_1fr] lg:px-10 lg:py-28">
        <aside className="flex flex-col gap-6">
          <div>
            <p className="text-[0.6875rem] uppercase tracking-[0.32em] text-taupe">Reviews</p>
            <h2 className="mt-3 font-display text-4xl font-light text-noir">{summary.averageRating.toFixed(1)} / 5</h2>
            <p className="mt-2 text-sm text-stone">{summary.reviewCount} approved review{summary.reviewCount === 1 ? "" : "s"}</p>
          </div>
          <dl className="grid gap-2 text-sm text-stone">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-2">
                <dt>{rating}★</dt>
                <dd className="h-2 bg-ivory"><span className="block h-2 bg-noir" style={{ width: `${summary.reviewCount ? (summary.breakdown[rating as 1 | 2 | 3 | 4 | 5] / summary.reviewCount) * 100 : 0}%` }} /></dd>
                <dd className="text-right">{summary.breakdown[rating as 1 | 2 | 3 | 4 | 5]}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div className="grid gap-8">
          {summary.gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {summary.gallery.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={image.url} src={image.url} alt={image.alt ?? "Review photo"} className="aspect-square w-full object-cover" />
              ))}
            </div>
          ) : null}
          <label className="flex w-fit flex-col gap-2">
            <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Sort reviews</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="h-11 border border-hairline bg-background px-3 text-sm text-noir focus:border-noir focus:outline-none">
              <option value="newest">Newest</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
              <option value="helpful">Most helpful</option>
            </select>
          </label>
          <ul className="grid gap-4">
            {reviews.map((review) => (
              <li key={review.id} className="border border-hairline bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="font-display text-xl text-noir">{review.title}</p><p className="text-xs uppercase tracking-[0.2em] text-taupe">{review.rating}★ · {review.authorName} · {formatDate(review.createdAt)}</p></div>
                  {review.isVerified ? <span className="border border-hairline px-3 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-stone">Verified Purchase</span> : null}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-stone">{review.body}</p>
                {review.images.length > 0 ? (
                  <div className="mt-4 flex gap-2">
                    {review.images.map((image) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={image.url} src={image.url} alt={image.alt ?? "Review photo"} className="size-20 object-cover" />
                    ))}
                  </div>
                ) : null}
                {review.adminReply ? <p className="mt-4 border-l border-hairline pl-4 text-sm text-stone">KHZR: {review.adminReply}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
