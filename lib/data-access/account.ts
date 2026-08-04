import "server-only"

import { prisma } from "@/lib/prisma"
import { resolveVerifiedClerkIdentity } from "@/lib/services/user-service"

export type AccountProfileDTO = {
  firstName: string
  lastName: string
  phone: string
  email: string
  clerkManagedEmail: boolean
  imageUrl: string
  hasImage: boolean
}

export type AccountAddressDTO = {
  id: string
  firstName: string
  lastName: string
  phone: string
  province: string
  city: string
  area: string
  streetAddress: string
  houseApartment: string
  postalCode: string
  deliveryNotes: string
  isDefault: boolean
}

function toAddressDTO(address: {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  region: string | null
  city: string
  area: string | null
  line1: string
  line2: string | null
  postalCode: string
  deliveryNotes: string | null
  isDefault: boolean
}): AccountAddressDTO {
  return {
    id: address.id,
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone ?? "",
    province: address.region ?? "",
    city: address.city,
    area: address.area ?? "",
    streetAddress: address.line1,
    houseApartment: address.line2 ?? "",
    postalCode: address.postalCode,
    deliveryNotes: address.deliveryNotes ?? "",
    isDefault: address.isDefault,
  }
}

export async function getAccountProfile(userId: string): Promise<AccountProfileDTO> {
  const [user, identity] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    resolveVerifiedClerkIdentity(),
  ])
  if (!user) {
    // The row may have been deleted or the database briefly unavailable. Never
    // crash the account page for missing optional data.
    return {
      firstName: identity?.firstName ?? "",
      lastName: identity?.lastName ?? "",
      phone: "",
      email: identity?.email ?? "",
      clerkManagedEmail: Boolean(identity?.clerkId),
      imageUrl: identity?.imageUrl ?? "",
      hasImage: identity?.hasImage ?? false,
    }
  }
  return {
    firstName: identity?.firstName ?? user.firstName ?? "",
    lastName: identity?.lastName ?? user.lastName ?? "",
    phone: user.phone ?? "",
    email: identity?.email ?? (user.email?.endsWith("@local.invalid") ? "" : user.email ?? ""),
    clerkManagedEmail: Boolean(user.clerkId),
    imageUrl: identity?.imageUrl ?? "",
    hasImage: identity?.hasImage ?? false,
  }
}

export async function listAccountAddresses(userId: string): Promise<AccountAddressDTO[]> {
  const addresses = await prisma.address.findMany({
    where: { userId, type: "SHIPPING" },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })
  return addresses.map(toAddressDTO)
}

export async function getAccountAddress(userId: string, id: string): Promise<AccountAddressDTO | null> {
  const address = await prisma.address.findFirst({ where: { id, userId, type: "SHIPPING" } })
  return address ? toAddressDTO(address) : null
}
