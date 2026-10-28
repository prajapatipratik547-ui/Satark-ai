/** Input limits shared by the server schema and the browser. Kept free of zod so the web bundle stays small. */

export const MAX_TEXT_LENGTH = 4000;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];
