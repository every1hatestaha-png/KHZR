import { AdminHeading } from "@/components/admin/admin-heading"
import { ShippingZoneForm } from "@/components/admin/shipping-zone-form"
import { listShippingZones } from "@/lib/services/shipping-service"

export const metadata = { title: "Shipping" }
export const dynamic = "force-dynamic"

export default async function AdminShippingPage() {
  const zones = await listShippingZones()

  return (
    <>
      <AdminHeading
        kicker="Commerce"
        title="Shipping settings"
        description="Manage Pakistan delivery zones, charges, active status and free-shipping thresholds."
      />

      <section className="flex flex-col gap-4">
        {zones.map((zone) => (
          <ShippingZoneForm
            key={zone.id}
            zone={{
              id: zone.id,
              name: zone.name,
              province: zone.province,
              cityMatch: zone.cityMatch,
              amount: Number(zone.amount),
              freeShippingThreshold: Number(zone.freeShippingThreshold),
              active: zone.active,
            }}
          />
        ))}
      </section>
    </>
  )
}
