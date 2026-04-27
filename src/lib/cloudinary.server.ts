import "server-only";

import { createHash, randomUUID } from "node:crypto";

import {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_DEFAULT_UPLOAD_FOLDER,
  type CloudinaryUploadKind,
  sanitizeCloudinaryFileName,
} from "@/lib/cloudinary";

const cloudinaryEnv = {
  apiKey: process.env.CLOUDINARY_API_KEY ?? "",
  apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? CLOUDINARY_DEFAULT_UPLOAD_FOLDER,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? "",
};

export function assertCloudinaryServerEnv() {
  if (!cloudinaryEnv.cloudName || !cloudinaryEnv.apiKey || !cloudinaryEnv.apiSecret) {
    throw new Error(
      "Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET."
    );
  }
}

function getUploadFolder(userId: string, kind: CloudinaryUploadKind) {
  const normalizedBase = cloudinaryEnv.uploadFolder
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return `${normalizedBase || CLOUDINARY_DEFAULT_UPLOAD_FOLDER}/${userId}/${kind}`;
}

function createSignature(params: Record<string, string | number>) {
  const serialized = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${serialized}${cloudinaryEnv.apiSecret}`)
    .digest("hex");
}

export function createCloudinaryUploadSignature({
  fileName,
  kind,
  userId,
}: {
  fileName: string;
  kind: CloudinaryUploadKind;
  userId: string;
}) {
  assertCloudinaryServerEnv();

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = getUploadFolder(userId, kind);
  const publicId = `${Date.now()}-${sanitizeCloudinaryFileName(fileName)}-${randomUUID().slice(
    0,
    8
  )}`;
  const signedParams = {
    allowed_formats: CLOUDINARY_ALLOWED_FORMATS.join(","),
    folder,
    overwrite: "false",
    public_id: publicId,
    timestamp,
    ...(cloudinaryEnv.uploadPreset ? { upload_preset: cloudinaryEnv.uploadPreset } : {}),
  };

  return {
    allowedFormats: signedParams.allowed_formats,
    apiKey: cloudinaryEnv.apiKey,
    folder,
    overwrite: signedParams.overwrite,
    publicId,
    signature: createSignature(signedParams),
    timestamp,
    uploadPreset: cloudinaryEnv.uploadPreset || undefined,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinaryEnv.cloudName}/image/upload`,
  };
}
