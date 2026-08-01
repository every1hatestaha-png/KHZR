import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { ProductDetailDTO } from "@/lib/data-access/site"

const TRIGGER_CLASS =
  "py-5 text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-noir hover:text-stone hover:no-underline [&_[data-slot=accordion-trigger-icon]]:text-champagne"

export function ProductAccordions({ product }: { product: ProductDetailDTO }) {
  return (
    <Accordion type="single" collapsible className="border-t border-hairline">
      <AccordionItem value="details">
        <AccordionTrigger className={TRIGGER_CLASS}>
          Details & Care
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-5 pb-5 text-sm leading-relaxed text-stone">
            <p>{product.description}</p>
            <dl className="flex flex-col gap-3 border-t border-hairline pt-5">
              <div className="grid grid-cols-[7.5rem_1fr] gap-6">
                <dt className="shrink-0 text-[0.6875rem] uppercase tracking-[0.24em] text-taupe">
                  Composition
                </dt>
                <dd>{product.composition}</dd>
              </div>
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
              Orders leave within two working days in FSC-certified packaging,
              and arrive within five. Complimentary shipping on all orders.
            </p>
            <p>
              Returns are accepted within thirty days of delivery — unworn,
              with tags intact — and the return postage is on us. Pieces that
              need adjustment are altered in-house, free of charge, for the
              first year of ownership.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
