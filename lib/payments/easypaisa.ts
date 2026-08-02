import { createUnavailableProvider } from "@/lib/payments/unavailable-provider"

// Official Easypaisa merchant parameter, endpoint, and signature details were not
// available from the public official pages fetched during implementation. This
// adapter intentionally fails closed until merchant documentation is supplied.
export const easypaisaProvider = createUnavailableProvider("easypaisa")
