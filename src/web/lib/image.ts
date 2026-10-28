import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, type ImageMimeType } from "../../shared/limits.js";

const MAX_DIMENSION = 1600;
const QUALITY = 0.85;
/** Original files above this are rejected before we even try to decode them. */
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export interface PreparedImage {
  base64: string;
  mimeType: ImageMimeType;
  previewUrl: string;
}

export type ImageProblem = "type" | "size";

export function checkImageFile(file: File): ImageProblem | null {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > MAX_INPUT_BYTES) return "size";
  return null;
}

/** Scale so the longer side is at most 1600 px; never upscale. */
export function fitWithin(width: number, height: number, max = MAX_DIMENSION) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, QUALITY);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => {
      reject(new Error("Could not read image"));
    };
    reader.readAsDataURL(blob);
  });
}

/** Resizes and re-encodes a screenshot (WebP, falling back to JPEG) to keep uploads small. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp");
  let mimeType: ImageMimeType = "image/webp";
  if (blob?.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg");
    mimeType = "image/jpeg";
  }
  if (!blob) throw new Error("Could not encode image");
  if (blob.size > MAX_IMAGE_BYTES) throw new Error("Image too large");

  return { base64: await blobToBase64(blob), mimeType, previewUrl: URL.createObjectURL(blob) };
}
