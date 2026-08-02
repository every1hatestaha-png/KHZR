import { z } from "zod"

export const pakistanAddressSchema = z.object({
  id: z.string().min(1).max(120).optional(),
  firstName: z.string().trim().min(1, "Enter a first name.").max(80),
  lastName: z.string().trim().min(1, "Enter a last name.").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  province: z.string().trim().min(1, "Select a province.").max(80),
  city: z.string().trim().min(1, "Enter a city.").max(100),
  area: z.string().trim().min(1, "Enter an area.").max(120),
  streetAddress: z.string().trim().min(1, "Enter a street address.").max(200),
  houseApartment: z.string().trim().min(1, "Enter a house or apartment.").max(120),
  postalCode: z.string().trim().max(20).optional().default(""),
  deliveryNotes: z.string().trim().max(1000).optional().default(""),
  isDefault: z.coerce.boolean().optional().default(false),
})

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  phone: z.string().trim().max(30).optional().default(""),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default("")
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address.",
    }),
})

export const addressIdSchema = z.object({
  id: z.string().min(1).max(120),
})
