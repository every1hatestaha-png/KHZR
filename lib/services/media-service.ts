import "server-only"

import { v2 as cloudinary } from "cloudinary"

export type UploadedImage = {
  url: string
  publicId: string
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

function cloud() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
  return cloudinary
}

/**
 * Rejects content whose signature is not a known raster image format.
 * SVG is intentionally excluded because it can carry scripts that would
 * otherwise be served to storefront visitors.
 */
function looksLikeImage(buffer: Uint8Array): boolean {
  if (buffer.length < 12) return false
  const matches = (sig: number[], offset = 0) =>
    sig.every((byte, i) => buffer[offset + i] === byte)

  if (matches([0xff, 0xd8, 0xff])) return true // JPEG
  if (matches([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true // PNG
  if (matches([0x52, 0x49, 0x46, 0x46]) && buffer[8] === 0x57) return true // RIFF…WEBP
  if (matches([0x47, 0x49, 0x46, 0x38])) return true // GIF87a / GIF89a
  if (matches([0x42, 0x4d])) return true // BMP
  if (matches([0x49, 0x49, 0x2a, 0x00])) return true // TIFF (little-endian)
  if (matches([0x4d, 0x4d, 0x00, 0x2a])) return true // TIFF (big-endian)
  if (
    matches([0x66, 0x74, 0x79, 0x70], 4) &&
    (matches([0x61, 0x76, 0x69, 0x66], 8) ||
      matches([0x61, 0x76, 0x69, 0x73], 8))
  ) {
    return true // AVIF / AVIS
  }
  return false
}

/**
 * Uploads an image to Cloudinary, returning the secure URL + public id.
 * Returns null when Cloudinary is not configured or the file is not a
 * supported raster image.
 */
export async function uploadProductImage(
  file: File
): Promise<UploadedImage | null> {
  if (!isCloudinaryConfigured()) return null
  if (!file || file.size === 0) return null

  const folder = process.env.CLOUDINARY_FOLDER ?? "khzr"
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!looksLikeImage(buffer)) return null

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloud().uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 2000, crop: "limit", quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed."))
          else
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            })
        }
      )
      stream.end(buffer)
    }
  )

  return { url: result.secure_url, publicId: result.public_id }
}
