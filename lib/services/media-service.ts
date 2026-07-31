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
 * Uploads an image to Cloudinary, returning the secure URL + public id.
 * Returns null when Cloudinary is not configured.
 */
export async function uploadProductImage(
  file: File
): Promise<UploadedImage | null> {
  if (!isCloudinaryConfigured()) return null
  if (!file || file.size === 0) return null

  const folder = process.env.CLOUDINARY_FOLDER ?? "khzr"
  const buffer = Buffer.from(await file.arrayBuffer())

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
