export const CLOUDINARY_UPLOAD_KINDS = ["cover", "gallery"] as const;

export type CloudinaryUploadKind = (typeof CLOUDINARY_UPLOAD_KINDS)[number];

export const CLOUDINARY_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const CLOUDINARY_ALLOWED_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
] as const;

export const CLOUDINARY_ACCEPT_ATTRIBUTE = CLOUDINARY_ALLOWED_IMAGE_TYPES.join(",");
export const CLOUDINARY_MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
export const CLOUDINARY_DEFAULT_UPLOAD_FOLDER = "merchant-books";
export const CLOUDINARY_MAX_FILES_BY_KIND: Record<CloudinaryUploadKind, number> = {
  cover: 1,
  gallery: 6,
};

const allowedImageTypeSet = new Set<string>(CLOUDINARY_ALLOWED_IMAGE_TYPES);

export function isAllowedCloudinaryImageType(mimeType: string) {
  return allowedImageTypeSet.has(mimeType.toLowerCase());
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

export function sanitizeCloudinaryFileName(fileName: string) {
  return (
    fileName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  );
}
