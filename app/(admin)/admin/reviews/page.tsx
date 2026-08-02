import Link from "next/link"
import { CheckIcon, EyeOffIcon, StarIcon, TrashIcon } from "lucide-react"
import { AdminHeading } from "@/components/admin/admin-heading"
import { Button } from "@/components/ui/button"
import {
  approveReviewAction,
  deleteReviewAction,
  featureReviewAction,
  hideReviewAction,
  replyReviewAction,
} from "@/lib/actions/review-actions"
import { listAdminReviews } from "@/lib/data-access/reviews"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "Reviews" }
export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  const reviews = await listAdminReviews()
  const pending = reviews.filter((review) => review.status === "PENDING").length
  const approved = reviews.filter((review) => review.status === "APPROVED").length
  const hidden = reviews.filter((review) => review.status === "HIDDEN").length

  return (
    <>
      <AdminHeading
        kicker="Commerce"
        title="Reviews"
        description={`${pending} pending · ${approved} approved · ${hidden} hidden`}
      />
      <ul className="grid gap-5">
        {reviews.map((review) => (
          <li key={review.id} className="border border-hairline bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  {review.status} · {review.rating}★ · {review.isVerified ? "Verified purchase" : "Unverified"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-light text-noir">{review.title}</h2>
                <p className="mt-1 text-sm text-stone">
                  <Link href={`/product/${review.product.slug}`} className="underline-offset-4 hover:underline">{review.product.name}</Link>
                  {" · "}{review.user?.email ?? "Customer"}{" · "}{formatDate(review.createdAt.toISOString())}
                </p>
              </div>
              {review.isFeatured ? <span className="border border-hairline px-3 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-stone">Featured</span> : null}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone">{review.body}</p>
            {review.images.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {review.images.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={image.id} src={image.url} alt={image.alt ?? "Review photo"} className="size-24 object-cover" />
                ))}
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionButton id={review.id} label="Approve" action={approveReviewAction} icon={<CheckIcon />} />
              <ActionButton id={review.id} label="Hide" action={hideReviewAction} icon={<EyeOffIcon />} />
              <ActionButton id={review.id} label={review.isFeatured ? "Unfeature" : "Feature"} action={featureReviewAction} icon={<StarIcon />} />
              <ActionButton id={review.id} label="Delete" action={deleteReviewAction} icon={<TrashIcon />} />
            </div>
            <form action={async (formData) => {
              "use server"
              await replyReviewAction({ id: review.id, adminReply: formData.get("adminReply") })
            }} className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Admin reply</span>
                <textarea name="adminReply" defaultValue={review.adminReply ?? ""} rows={3} className="w-full border border-hairline bg-background px-3 py-2 text-sm text-noir focus:border-noir focus:outline-none" />
              </label>
              <Button type="submit" variant="outline" size="sm" className="w-fit">Save Reply</Button>
            </form>
          </li>
        ))}
      </ul>
    </>
  )
}

function ActionButton({ id, label, action, icon }: { id: string; label: string; action: (input: unknown) => Promise<unknown>; icon: React.ReactNode }) {
  return (
    <form action={async () => {
      "use server"
      await action({ id })
    }}>
      <Button type="submit" variant="outline" size="sm">{icon}{label}</Button>
    </form>
  )
}
