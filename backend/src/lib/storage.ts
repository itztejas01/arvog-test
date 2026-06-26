import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  deleteProductImage,
  getPublicImageUrl,
  getSignedImageUrl,
  isS3StorageEnabled,
  productImageKey,
  uploadProductImage,
} from "./s3";

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export function buildImageFilename(originalName: string) {
  const ext = path.extname(originalName);
  return `${crypto.randomUUID()}${ext}`;
}

export async function persistProductImage(file: Express.Multer.File) {
  const filename = buildImageFilename(file.originalname);

  if (isS3StorageEnabled()) {
    const key = productImageKey(filename);
    await uploadProductImage(key, file.buffer, file.mimetype);
    return key;
  }

  const fullPath = path.join(uploadDir, filename);
  await fs.promises.writeFile(fullPath, file.buffer);
  return filename;
}

export async function removeProductImage(imagePath: string | null) {
  if (!imagePath) return;

  if (isS3StorageEnabled()) {
    await deleteProductImage(imagePath);
    return;
  }

  const fullPath = path.join(uploadDir, path.basename(imagePath));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export async function resolveProductImageUrl(imagePath: string | null) {
  if (!imagePath) return null;

  if (isS3StorageEnabled()) {
    return (await getSignedImageUrl(imagePath)) ?? getPublicImageUrl(imagePath);
  }

  return `/api/uploads/${path.basename(imagePath)}`;
}

export { isS3StorageEnabled };
