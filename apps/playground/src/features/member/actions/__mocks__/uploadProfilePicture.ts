import type { UploadProfilePictureResult } from "../uploadProfilePicture"

export async function uploadProfilePicture(
  formData: FormData,
): Promise<UploadProfilePictureResult> {
  const file = formData.get("file")
  return {
    ok: true,
    id: crypto.randomUUID().replaceAll("-", "").slice(0, 24),
    url: file instanceof File ? URL.createObjectURL(file) : "https://placehold.co/240x240",
  }
}
