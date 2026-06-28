import crypto from "crypto";
import fs from "fs";
import path from "path";

const uploadRoot = path.join(__dirname, "../../uploads");
export const photosDir = path.join(uploadRoot, "photos");
export const bulkUploadDir = path.join(uploadRoot, "bulk");

export const PRODUCT_IMAGE_PREFIX = "photos";

function ensureUploadDirs() {
  for (const dir of [uploadRoot, photosDir, bulkUploadDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

ensureUploadDirs();

export function buildImageFilename(originalName: string) {
  const ext = path.extname(originalName);
  return `${crypto.randomUUID()}${ext}`;
}

export async function persistProductImage(file: Express.Multer.File) {
  const filename = buildImageFilename(file.originalname);
  const relativePath = `${PRODUCT_IMAGE_PREFIX}/${filename}`;
  const fullPath = path.join(uploadRoot, relativePath);
  await fs.promises.writeFile(fullPath, file.buffer);
  return relativePath;
}

function resolveImageDiskPath(imagePath: string) {
  if (imagePath.includes("/") || imagePath.includes("\\")) {
    return path.join(uploadRoot, imagePath);
  }

  const inPhotos = path.join(photosDir, imagePath);
  if (fs.existsSync(inPhotos)) {
    return inPhotos;
  }

  return path.join(uploadRoot, imagePath);
}

export async function removeProductImage(imagePath: string | null) {
  if (!imagePath) return;

  const fullPath = resolveImageDiskPath(imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export async function resolveProductImageUrl(imagePath: string | null) {
  if (!imagePath) return null;

  const normalized = imagePath.replace(/\\/g, "/");
  if (normalized.includes("/")) {
    return `/api/uploads/${normalized}`;
  }

  const inPhotos = path.join(photosDir, imagePath);
  if (fs.existsSync(inPhotos)) {
    return `/api/uploads/${PRODUCT_IMAGE_PREFIX}/${imagePath}`;
  }

  return `/api/uploads/${imagePath}`;
}
