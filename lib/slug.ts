// Pure username-handle helpers. Kept firebase-free so they're trivially
// unit-testable and cheap to import.

/** The maximum length of a generated/normalized handle. */
export const MAX_USERNAME_LENGTH = 24;

/** The minimum length a handle must have to be valid. */
export const MIN_USERNAME_LENGTH = 3;

/** Reduce arbitrary text to a URL-safe handle: lowercase alphanumerics only. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, MAX_USERNAME_LENGTH);
}

/** Whether a slug is long enough to be a valid handle. */
export function isValidUsername(slug: string): boolean {
  return slug.length >= MIN_USERNAME_LENGTH;
}
