"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/actions/admin-actions"
import { updateShippingZone } from "@/lib/services/shipping-service"
import { adminShippingZoneUpdateSchema } from "@/lib/validations/checkout"

export type ShippingActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

export async function updateShippingZoneAction(
  input: unknown
): Promise<ShippingActionResult> {
  const denied = await requireAdmin()
  if (denied) return { ok: false, error: denied }

  const parsed = adminShippingZoneUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Shipping settings could not be read." }
  }

  try {
    await updateShippingZone(parsed.data)
    revalidatePath("/admin/shipping")
    return { ok: true, message: "Shipping zone updated." }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Shipping zone could not be updated.",
    }
  }
}
