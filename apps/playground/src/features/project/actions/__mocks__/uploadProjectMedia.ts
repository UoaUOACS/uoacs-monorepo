import type { UploadMediaResult } from "../uploadProjectMedia"

export async function uploadProjectMedia(formData: FormData): Promise<UploadMediaResult> {
  const file = formData.get("file")
  return {
    ok: true,
    // A new ID each time, so a grid can hold several uploads
    id: crypto.randomUUID().replaceAll("-", "").slice(0, 24),
    url: file instanceof File ? URL.createObjectURL(file) : "https://placehold.co/800x600",
    alt: file instanceof File ? file.name : "Image",
    width: 800,
    height: 600,
  }
}
