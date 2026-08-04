"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAccountProfile, listAccountAddresses } from "@/lib/data-access/account"
import { getSessionUserId, resolveDbUser, resolveVerifiedClerkIdentity } from "@/lib/services/user-service"
import { adminNoteForMenu, getAdminAccess } from "@/lib/services/admin-auth"
import { rateLimitKey } from "@/lib/services/rate-limit"
import {
  addressIdSchema,
  pakistanAddressSchema,
  profileSchema,
} from "@/lib/validations/account"

export type AccountActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

export async function getAccountMenuAction() {
  // Session state comes from the session token alone. Profile enrichment is
  // best-effort: a Clerk Backend API hiccup must not render a signed-in owner
  // as signed out (which also hid the Admin Dashboard entry).
  const userId = await getSessionUserId()
  if (!userId) return { ok: true as const, signedIn: false as const }

  const [identity, access] = await Promise.all([
    resolveVerifiedClerkIdentity(),
    getAdminAccess(),
  ])

  return {
    ok: true as const,
    signedIn: true as const,
    profile: {
      firstName: identity?.firstName ?? "",
      lastName: identity?.lastName ?? "",
      email: identity?.email ?? "",
      imageUrl: identity?.imageUrl ?? "",
      hasImage: identity?.hasImage ?? false,
    },
    isAdmin: access.ok,
    adminNote: access.ok ? null : adminNoteForMenu(access.reason),
  }
}

export async function getCheckoutAccountAction() {
  const user = await resolveDbUser()
  if (!user) return { ok: true as const, profile: null, addresses: [] }
  const [profile, addresses] = await Promise.all([
    getAccountProfile(user.id),
    listAccountAddresses(user.id),
  ])
  return { ok: true as const, profile, addresses }
}

export async function updateProfileAction(input: unknown): Promise<AccountActionResult> {
  const user = await resolveDbUser()
  if (!user) return { ok: false, error: "Sign in to update your profile." }
  const allowed = await rateLimitKey("account:profile", user.id, 20, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please try again later." }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Profile could not be read." }
  const identity = await resolveVerifiedClerkIdentity()

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Clerk stays authoritative for identity; never blank a stored name.
        firstName: identity?.firstName ?? (parsed.data.firstName || undefined),
        lastName: identity?.lastName ?? (parsed.data.lastName || undefined),
        phone: parsed.data.phone || null,
        email: identity?.email ?? undefined,
      },
    })
    revalidatePath("/account")
    revalidatePath("/account/profile")
    revalidatePath("/account/settings")
    return { ok: true, message: "Profile updated." }
  } catch {
    console.error("[account] profile update failed")
    return { ok: false, error: "We could not update your profile." }
  }
}

export async function saveAddressAction(input: unknown): Promise<AccountActionResult> {
  const user = await resolveDbUser()
  if (!user) return { ok: false, error: "Sign in to save addresses." }
  const allowed = await rateLimitKey("account:address:save", user.id, 30, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please try again later." }

  const parsed = pakistanAddressSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Address could not be read." }
  const address = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      if (address.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, type: "SHIPPING" },
          data: { isDefault: false },
        })
      }

      const data = {
        type: "SHIPPING" as const,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        line1: address.streetAddress,
        line2: address.houseApartment,
        area: address.area,
        city: address.city,
        region: address.province,
        postalCode: address.postalCode || "",
        country: "PK",
        deliveryNotes: address.deliveryNotes || null,
        isDefault: address.isDefault,
      }

      if (address.id) {
        await tx.address.updateMany({ where: { id: address.id, userId: user.id }, data })
      } else {
        const count = await tx.address.count({ where: { userId: user.id, type: "SHIPPING" } })
        await tx.address.create({
          data: { ...data, userId: user.id, isDefault: address.isDefault || count === 0 },
        })
      }
    })
    revalidatePath("/account")
    revalidatePath("/account/addresses")
    return { ok: true, message: address.id ? "Address updated." : "Address saved." }
  } catch {
    console.error("[account] address save failed")
    return { ok: false, error: "Address could not be saved." }
  }
}

export async function deleteAddressAction(input: unknown): Promise<AccountActionResult> {
  const user = await resolveDbUser()
  if (!user) return { ok: false, error: "Sign in to delete addresses." }
  const allowed = await rateLimitKey("account:address:delete", user.id, 20, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please try again later." }

  const parsed = addressIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Address could not be read." }

  try {
    await prisma.address.deleteMany({ where: { id: parsed.data.id, userId: user.id, type: "SHIPPING" } })
    const next = await prisma.address.findFirst({
      where: { userId: user.id, type: "SHIPPING" },
      orderBy: { createdAt: "desc" },
    })
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
    revalidatePath("/account")
    revalidatePath("/account/addresses")
    return { ok: true, message: "Address deleted." }
  } catch {
    return { ok: false, error: "Address could not be deleted." }
  }
}

export async function setDefaultAddressAction(input: unknown): Promise<AccountActionResult> {
  const user = await resolveDbUser()
  if (!user) return { ok: false, error: "Sign in to update addresses." }
  const allowed = await rateLimitKey("account:address:default", user.id, 30, 60 * 60 * 1000)
  if (!allowed) return { ok: false, error: "Please try again later." }

  const parsed = addressIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Address could not be read." }

  try {
    await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({ where: { id: parsed.data.id, userId: user.id, type: "SHIPPING" } })
      if (!address) throw new Error("Address not found.")
      await tx.address.updateMany({ where: { userId: user.id, type: "SHIPPING" }, data: { isDefault: false } })
      await tx.address.update({ where: { id: address.id }, data: { isDefault: true } })
    })
    revalidatePath("/account")
    revalidatePath("/account/addresses")
    return { ok: true, message: "Default address updated." }
  } catch {
    return { ok: false, error: "Default address could not be updated." }
  }
}
