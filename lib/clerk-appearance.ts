/**
 * One KHZR appearance for every Clerk-rendered surface (sign in, sign up,
 * verification steps, user button popover). Clerk ships a blue palette; these
 * tokens map it onto the KHZR system defined in app/globals.css.
 *
 * Variable names follow the Clerk v7 `Variables` contract — the older
 * `colorText` / `colorInputBackground` / `spacingUnit` names are silently
 * ignored by this version, which is why stock blue survived earlier passes.
 *
 * Safe to import from both server and client components.
 */

const NOIR = "#121110"
const WARM_WHITE = "#faf7f2"
const IVORY = "#f3eee6"
const TAUPE = "#8a7b6c"
const STONE = "#5c5248"
const CHAMPAGNE = "#c2a878"
const DANGER = "#8c2f21"
const HAIRLINE = "rgba(18, 17, 16, 0.12)"

export const khzrClerkAppearance = {
  variables: {
    colorPrimary: NOIR,
    colorPrimaryForeground: WARM_WHITE,
    colorForeground: NOIR,
    colorMuted: IVORY,
    colorMutedForeground: TAUPE,
    colorBackground: WARM_WHITE,
    colorInput: WARM_WHITE,
    colorInputForeground: NOIR,
    colorBorder: HAIRLINE,
    colorRing: CHAMPAGNE,
    colorShadow: "transparent",
    colorNeutral: NOIR,
    colorDanger: DANGER,
    colorSuccess: STONE,
    colorWarning: CHAMPAGNE,
    colorShimmer: IVORY,
    colorModalBackdrop: "rgba(18, 17, 16, 0.45)",
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontFamilyButtons: "var(--font-inter), Inter, sans-serif",
    fontSize: "0.875rem",
    borderRadius: "0",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "!rounded-none !border !border-hairline !shadow-none",
    card: "!rounded-none !border-0 !bg-card !shadow-none",
    logoBox: "!hidden",
    header: "!gap-2",
    headerTitle: "!font-display !text-2xl !font-light !text-noir",
    headerSubtitle: "!text-sm !text-taupe",

    socialButtons: "!gap-2",
    socialButtonsBlockButton:
      "!min-h-11 !rounded-none !border !border-hairline !bg-warm-white !text-noir !shadow-none hover:!bg-ivory",
    socialButtonsBlockButtonText: "!text-sm !font-normal !text-noir",

    dividerRow: "!my-4",
    dividerLine: "!bg-hairline",
    dividerText: "!text-[0.625rem] !uppercase !tracking-[0.24em] !text-taupe",

    formFieldLabel: "!text-[0.6875rem] !uppercase !tracking-[0.24em] !text-taupe",
    formFieldInput:
      "!min-h-11 !rounded-none !border !border-hairline !bg-background !text-noir !shadow-none focus:!border-noir focus:!ring-0",
    formFieldInputShowPasswordButton: "!text-taupe hover:!text-noir",
    formFieldAction: "!text-champagne hover:!text-stone",
    formFieldErrorText: "!text-destructive",
    formFieldSuccessText: "!text-stone",
    otpCodeFieldInput: "!rounded-none !border !border-hairline !text-noir",

    formButtonPrimary:
      "!min-h-11 !rounded-none !bg-noir !text-[0.6875rem] !font-medium !uppercase !tracking-[0.24em] !text-warm-white !shadow-none hover:!bg-stone",
    formButtonReset: "!text-taupe hover:!text-noir",
    formResendCodeLink: "!text-champagne hover:!text-stone",

    identityPreview: "!rounded-none !border !border-hairline !bg-ivory",
    identityPreviewText: "!text-noir",
    identityPreviewEditButton: "!text-champagne hover:!text-stone",

    avatarBox: "!rounded-full !border !border-hairline",
    badge: "!rounded-none !border !border-champagne/45 !bg-champagne/10 !text-champagne",
    alert: "!rounded-none !border !border-hairline",
    alertText: "!text-noir",
    spinner: "!text-noir",

    footer: "!bg-transparent",
    footerAction: "!bg-transparent",
    footerActionText: "!text-taupe",
    footerActionLink: "!font-medium !text-champagne hover:!text-stone",

    userButtonPopoverCard: "!rounded-none !border !border-hairline !shadow-none",
    userButtonPopoverActionButton: "!rounded-none !text-noir hover:!bg-ivory",
    userButtonPopoverFooter: "!hidden",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    shimmer: false,
  },
}
