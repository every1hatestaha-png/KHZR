"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { updateProfileAction } from "@/lib/actions/account-actions"
import type { AccountProfileDTO } from "@/lib/data-access/account"

const inputClass = "h-12 w-full border border-hairline bg-background px-4 text-sm text-noir focus:border-noir focus:outline-none"

export function ProfileForm({ profile }: { profile: AccountProfileDTO }) {
  const [pending, startTransition] = React.useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfileAction({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        email: formData.get("email"),
      })
      if (res.ok) toast.success(res.message)
      else toast.error(res.error)
    })
  }

  return (
    <form action={submit} className="grid gap-5 border border-hairline bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">First Name</span>
          <input name="firstName" required defaultValue={profile.firstName} className={inputClass} />
        </label>
        <label className="grid gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Last Name</span>
          <input name="lastName" required defaultValue={profile.lastName} className={inputClass} />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Phone Number</span>
        <input name="phone" type="tel" defaultValue={profile.phone} className={inputClass} />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Email <span className="normal-case tracking-normal">(optional)</span></span>
        <input name="email" type="email" defaultValue={profile.email} className={inputClass} />
      </label>
      {profile.clerkManagedEmail ? (
        <p className="text-xs leading-relaxed text-taupe">Clerk remains the source of truth for sign-in email. This optional email is used for store contact preferences.</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  )
}
