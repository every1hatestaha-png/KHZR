"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { UploadIcon, UserRoundIcon, XIcon } from "lucide-react"
import { ClerkClientProvider } from "@/components/providers/clerk-client-provider"
import { Button } from "@/components/ui/button"
import { updateProfileAction } from "@/lib/actions/account-actions"
import type { AccountProfileDTO } from "@/lib/data-access/account"

const inputClass = "h-12 w-full border border-hairline bg-background px-4 text-sm text-noir focus:border-noir focus:outline-none"
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function ProfileForm({ profile }: { profile: AccountProfileDTO }) {
  if (!clerkPublishableKey) return <ProfileFormInner profile={profile} />
  return <ClerkClientProvider><ProfileFormWithClerk profile={profile} /></ClerkClientProvider>
}

function ProfileFormWithClerk({ profile }: { profile: AccountProfileDTO }) {
  const { user } = useUser()
  return <ProfileFormInner profile={profile} user={user ?? null} />
}

function ProfileFormInner({ profile, user = null }: { profile: AccountProfileDTO; user?: ReturnType<typeof useUser>["user"] | null }) {
  const [pending, startTransition] = React.useTransition()
  const [imagePending, setImagePending] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.trim().toUpperCase()
  const imageUrl = user?.hasImage ? user.imageUrl : profile.hasImage ? profile.imageUrl : ""

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfileAction({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
      })
      if (res.ok) toast.success(res.message)
      else toast.error(res.error)
    })
  }

  async function uploadPicture(files: FileList | null) {
    const file = files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      toast.error("Upload an image smaller than 8 MB.")
      return
    }
    setImagePending(true)
    try {
      await user.setProfileImage({ file })
      await user.reload()
      toast.success("Profile picture updated.")
    } catch {
      toast.error("We could not update your profile picture.")
    } finally {
      setImagePending(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function removePicture() {
    if (!user) return
    setImagePending(true)
    try {
      await user.setProfileImage({ file: null })
      await user.reload()
      toast.success("Profile picture removed.")
    } catch {
      toast.error("We could not remove your profile picture.")
    } finally {
      setImagePending(false)
    }
  }

  return (
    <form action={submit} className="grid gap-5 border border-hairline bg-card p-4 sm:p-6">
      <div className="flex flex-col items-start gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void uploadPicture(e.target.files)} />
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Profile picture" className="size-20 rounded-full border border-hairline object-cover" />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-full border border-hairline bg-ivory text-lg uppercase text-noir">{initials || <UserRoundIcon />}</span>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={imagePending} className="min-h-11" onClick={() => fileRef.current?.click()}><UploadIcon />{imagePending ? "Updating..." : "Upload picture"}</Button>
          <Button type="button" variant="ghost" disabled={imagePending || !user?.hasImage} className="min-h-11" onClick={() => void removePicture()}><XIcon />Remove custom picture</Button>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">First Name</span>
          <input name="firstName" readOnly aria-readonly defaultValue={profile.firstName} className={`${inputClass} bg-ivory/60`} />
        </label>
        <label className="grid gap-2">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Last Name</span>
          <input name="lastName" readOnly aria-readonly defaultValue={profile.lastName} className={`${inputClass} bg-ivory/60`} />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Verified Email</span>
        <input type="email" readOnly value={profile.email} className={`${inputClass} bg-ivory/60`} />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">Phone Number</span>
        <input name="phone" type="tel" defaultValue={profile.phone} className={inputClass} />
      </label>
      <p className="text-xs leading-relaxed text-taupe">Clerk is the source of truth for your name, verified email and profile picture. KHZR stores only your phone number for order contact.</p>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  )
}
