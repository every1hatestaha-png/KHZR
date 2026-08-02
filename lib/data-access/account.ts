import "server-only"

import { prisma } from "@/lib/prisma"

export type AccountProfileDTO = {
  firstName: string
  lastName: string
  phone: string
  email: string
  clerkManagedEmail: boolean
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
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    email: user.email?.endsWith("@local.invalid") ? "" : user.email ?? "",
    clerkManagedEmail: Boolean(user.clerkId),
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
