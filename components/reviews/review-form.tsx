"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { submitReviewAction } from "@/lib/actions/review-actions"

const inputClass = "w-full border border-hairline bg-background px-4 py-3 text-sm text-noir focus:border-noir focus:outline-none"

export function ReviewForm({ productSlug, eligibility }: { productSlug: string; eligibility: { signedIn: boolean; purchased: boolean; alreadyReviewed: boolean } }) {
  const [pending, startTransition] = React.useTransition()

  if (!eligibility.signedIn) return <p className="text-sm text-stone">Sign in to review products you have purchased.</p>
  if (!eligibility.purchased) return <p className="text-sm text-stone">Only verified purchasers can review this product.</p>
  if (eligibility.alreadyReviewed) return <p className="text-sm text-stone">You have already reviewed this product.</p>

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await submitReviewAction({
        productSlug,
        rating: formData.get("rating"),
        title: formData.get("title"),
        body: formData.get("body"),
        imageUrls: formData.get("imageUrls"),
      })
      if (res.ok) toast.success(res.message)
      else toast.error(res.error)
    })
  }

  return (
    <form action={submit} className="grid gap-4 border border-hairline bg-card p-6">
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Rating</span>
        <select name="rating" required defaultValue="5" className="h-11 border border-hairline bg-background px-3 text-sm text-noir focus:border-noir focus:outline-none">
          {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Title</span>
        <input name="title" required maxLength={120} className={inputClass} />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Review</span>
        <textarea name="body" required rows={5} maxLength={3000} className={inputClass} />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Photo URLs <span className="normal-case tracking-normal">(optional, up to 5)</span></span>
        <textarea name="imageUrls" rows={3} className={inputClass} placeholder="One image URL per line" />
      </label>
      <Button type="submit" disabled={pending} className="w-fit">{pending ? "Submitting..." : "Submit Review"}</Button>
    </form>
  )
}
