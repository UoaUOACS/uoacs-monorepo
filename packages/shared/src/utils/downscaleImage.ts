const QUALITY = 0.85

const encode = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY))

const scale = async (file: File, maxDimension: number): Promise<File> => {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * ratio)
  canvas.height = Math.round(bitmap.height * ratio)
  const context = canvas.getContext("2d")
  if (!context) {
    bitmap.close()
    return file
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let blob = await encode(canvas, "image/webp")
  // Safari encodes PNG when it cannot encode WebP, so fall back to JPEG for photos
  if (blob?.type !== "image/webp" && file.type === "image/jpeg") {
    blob = await encode(canvas, "image/jpeg")
  }
  if (!blob || !["image/webp", "image/jpeg"].includes(blob.type) || blob.size >= file.size) {
    return file
  }
  const extension = blob.type === "image/webp" ? "webp" : "jpg"
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${extension}`, { type: blob.type })
}

/**
 * Scales an image down so its longest side is `maxDimension` or less, and encodes it as WebP
 * (or JPEG for JPEG inputs when the browser cannot encode WebP).
 * Returns the original file if it is already `maxBytes` or less, if the browser cannot decode or
 * encode it, or if the result is not smaller.
 */
export const downscaleImage = async (
  file: File,
  { maxDimension, maxBytes }: { maxDimension: number; maxBytes: number },
): Promise<File> => {
  if (file.size <= maxBytes) return file
  try {
    return await scale(file, maxDimension)
  } catch (error) {
    console.warn("[downscaleImage] Uploading the original image", { error, type: file.type })
    return file
  }
}
