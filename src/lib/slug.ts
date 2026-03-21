export function slugify(value?: string | null) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildBookSlug(title?: string | null, id?: string | null) {
  const safeTitle = slugify(title);
  const safeId = String(id ?? "");
  return `${safeTitle}--${safeId}`;
}

export function parseBookIdFromSlug(slug?: string | null) {
  const safeSlug = String(slug ?? "");
  const index = safeSlug.lastIndexOf("--");
  if (index === -1) return safeSlug;
  return safeSlug.slice(index + 2);
}