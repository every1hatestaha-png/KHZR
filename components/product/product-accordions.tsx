import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { ProductDetailDTO } from "@/lib/data-access/site"
import { parseProductMerchandising, productMerchandisingRows } from "@/lib/product-merchandising"

const TRIGGER_CLASS =
  "py-5 text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-noir hover:text-stone hover:no-underline [&_[data-slot=accordion-trigger-icon]]:text-champagne"

export function ProductAccordions({ product }: { product: ProductDetailDTO }) {
  const merchandising = parseProductMerchandising(product.description)
  const detailRows = productMerchandisingRows(merchandising)
  return (
    <Accordion type="single" collapsible className="border-t border-hairline">
      <AccordionItem value="details">
        <AccordionTrigger className={TRIGGER_CLASS}>
          Details & Care
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-5 pb-5 text-sm leading-relaxed text-stone">
            {merchandising.body ? <p>{merchandising.body}</p> : null}
            <dl className="flex flex-col gap-3 border-t border-hairline pt-5">
              <div className="grid grid-cols-[7.5rem_1fr] gap-6">
                <dt className="shrink-0 text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  Category
                </dt>
                <dd>Ready to Wear</dd>
              </div>
              <div className="grid grid-cols-[7.5rem_1fr] gap-6">
                <dt className="shrink-0 text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  Fabric
                </dt>
                <dd>{product.composition}</dd>
              </div>
              {detailRows.map((item) => (
                <div key={item.label} className="grid grid-cols-[7.5rem_1fr] gap-6">
                  <dt className="shrink-0 text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                    {item.label}
                  </dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[7.5rem_1fr] gap-6">
                <dt className="shrink-0 text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  Care
                </dt>
                <dd>{product.care}</dd>
              </div>
            </dl>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shipping">
        <AccordionTrigger className={TRIGGER_CLASS}>
          Shipping & Returns
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4 pb-5 text-sm leading-relaxed text-stone">
            <p>
              Lahore delivery target is 2 to 3 business days. Pakistan delivery
              options use the current shipping system and are confirmed at checkout.
            </p>
            <p>
              Returns are accepted within 7 days after delivery. Items must be
              unused, unwashed, in original condition, with tags attached.
            </p>
            <p>Orders ship in simple packaging with a red KHZR tag.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
