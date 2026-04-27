"use client";

import * as React from "react";
import Image from "next/image";
import { LoaderCircle, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { normalizeCloudinaryUrl } from "@/lib/books";
import {
  CLOUDINARY_ACCEPT_ATTRIBUTE,
  CLOUDINARY_MAX_FILE_SIZE_BYTES,
  CLOUDINARY_MAX_FILES_BY_KIND,
  formatFileSize,
  isAllowedCloudinaryImageType,
  type CloudinaryUploadKind,
} from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

type CloudinarySignatureResponse = {
  allowedFormats: string;
  apiKey: string;
  folder: string;
  overwrite: string;
  publicId: string;
  signature: string;
  timestamp: number;
  uploadPreset?: string;
  uploadUrl: string;
};

type CloudinaryUploadResponse = {
  error?: { message?: string } | string;
  secure_url?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Upload failed.";
}

function getPreviewUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "res.cloudinary.com") {
      return normalizeCloudinaryUrl(url, 480);
    }

    if (parsed.hostname === "picsum.photos") {
      return url;
    }
  } catch {}

  return null;
}

async function uploadFileToCloudinary(file: File, kind: CloudinaryUploadKind) {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      kind,
      mimeType: file.type,
    }),
  });

  const signJson = (await signRes.json().catch(() => null)) as
    | ({ error?: string } & Partial<CloudinarySignatureResponse>)
    | null;
  if (!signRes.ok || !signJson) {
    throw new Error(signJson?.error ?? "Could not prepare upload.");
  }

  if (
    !signJson.apiKey ||
    !signJson.allowedFormats ||
    !signJson.folder ||
    !signJson.publicId ||
    !signJson.signature ||
    !signJson.timestamp ||
    !signJson.uploadUrl
  ) {
    throw new Error("Upload signature response is incomplete.");
  }

  const formData = new FormData();
  formData.set("allowed_formats", signJson.allowedFormats);
  formData.set("api_key", signJson.apiKey);
  formData.set("file", file);
  formData.set("folder", signJson.folder);
  formData.set("overwrite", signJson.overwrite ?? "false");
  formData.set("public_id", signJson.publicId);
  formData.set("signature", signJson.signature);
  formData.set("timestamp", String(signJson.timestamp));
  if (signJson.uploadPreset) {
    formData.set("upload_preset", signJson.uploadPreset);
  }

  const uploadRes = await fetch(signJson.uploadUrl, {
    method: "POST",
    body: formData,
  });
  const uploadJson = (await uploadRes.json().catch(() => null)) as
    | CloudinaryUploadResponse
    | null;

  if (!uploadRes.ok || !uploadJson?.secure_url) {
    const cloudinaryError =
      typeof uploadJson?.error === "string"
        ? uploadJson.error
        : uploadJson?.error?.message;

    throw new Error(cloudinaryError ?? "Cloudinary upload failed.");
  }

  return uploadJson.secure_url;
}

export function CloudinaryImageUploadField({
  description,
  disabled = false,
  kind,
  label,
  onChange,
  required = false,
  values,
}: {
  description?: string;
  disabled?: boolean;
  kind: CloudinaryUploadKind;
  label: string;
  onChange: (nextValues: string[]) => void;
  required?: boolean;
  values: string[];
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const maxFiles = CLOUDINARY_MAX_FILES_BY_KIND[kind];
  const isSingle = maxFiles === 1;
  const [error, setError] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadLabel, setUploadLabel] = React.useState("");

  const onRemove = (index: number) => {
    onChange(values.filter((_, valueIndex) => valueIndex !== index));
  };

  const onSelectFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selectedFiles.length || disabled || isUploading) {
      return;
    }

    setError("");

    const invalidFile = selectedFiles.find((file) => {
      if (!isAllowedCloudinaryImageType(file.type)) {
        setError("Upload a JPG, PNG, WebP, or AVIF image.");
        return true;
      }

      if (file.size > CLOUDINARY_MAX_FILE_SIZE_BYTES) {
        setError(
          `Each image must be ${formatFileSize(CLOUDINARY_MAX_FILE_SIZE_BYTES)} or smaller.`
        );
        return true;
      }

      return false;
    });

    if (invalidFile) {
      return;
    }

    const remainingSlots = isSingle ? 1 : Math.max(0, maxFiles - values.length);
    if (!remainingSlots) {
      setError(
        `You can upload up to ${maxFiles} ${maxFiles === 1 ? "image" : "images"} here.`
      );
      return;
    }

    const files = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more ${
          remainingSlots === 1 ? "image" : "images"
        } can be added.`
      );
    }

    setIsUploading(true);

    try {
      let nextValues = isSingle ? [] : [...values];

      for (const [index, file] of files.entries()) {
        setUploadLabel(`Uploading ${index + 1} of ${files.length}`);
        const secureUrl = await uploadFileToCloudinary(file, kind);
        nextValues = isSingle ? [secureUrl] : [...nextValues, secureUrl];
        onChange(nextValues);
      }
    } catch (uploadError) {
      const message = getErrorMessage(uploadError);
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
      setUploadLabel("");
    }
  };

  return (
    <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-background/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {label}
            {required ? " *" : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {description ??
              `JPG, PNG, WebP, or AVIF up to ${formatFileSize(
                CLOUDINARY_MAX_FILE_SIZE_BYTES
              )}.`}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              {uploadLabel || "Uploading..."}
            </>
          ) : (
            <>
              <Upload className="size-4" />
              {isSingle && values.length ? "Replace image" : "Upload image"}
            </>
          )}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={CLOUDINARY_ACCEPT_ATTRIBUTE}
        multiple={!isSingle}
        className="sr-only"
        onChange={onSelectFiles}
        disabled={disabled || isUploading}
      />

      {values.length ? (
        <div
          className={cn(
            "grid gap-3",
            isSingle ? "sm:grid-cols-[minmax(0,220px)]" : "sm:grid-cols-2 xl:grid-cols-3"
          )}
        >
          {values.map((url, index) => {
            const previewUrl = getPreviewUrl(url);

            return (
              <div
                key={`${url}-${index}`}
                className="overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/80"
              >
                <div className="relative aspect-[4/5] bg-muted/50">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt={`${label} ${index + 1}`}
                      fill
                      sizes={
                        isSingle
                          ? "220px"
                          : "(min-width: 1280px) 240px, (min-width: 640px) 50vw, 100vw"
                      }
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
                      Preview unavailable for this image host.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 truncate text-xs text-primary hover:underline"
                  >
                    {url}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 rounded-xl"
                    onClick={() => onRemove(index)}
                    disabled={disabled || isUploading}
                    aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-4 py-6 text-center text-sm text-muted-foreground">
          {kind === "cover"
            ? "Upload one cover image to fill the required field."
            : `Upload up to ${maxFiles} gallery images.`}
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
