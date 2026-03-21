export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildBookSlug(title: string, id: string) {
  return `${slugify(title)}--${id}`;
}

export function parseBookIdFromSlug(slug: string) {
  const index = slug.lastIndexOf("--");
  if (index === -1) return slug;
  return slug.slice(index + 2);
}
