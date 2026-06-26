import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION || "us-east-1";
const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");

export function isS3StorageEnabled() {
  return Boolean(bucket);
}

let client: S3Client | null = null;

function getClient() {
  if (!client) {
    client = new S3Client({ region });
  }
  return client;
}

export async function uploadProductImage(
  key: string,
  body: Buffer,
  contentType: string,
) {
  if (!bucket) throw new Error("AWS_S3_BUCKET is not configured");

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return key;
}

export async function deleteProductImage(key: string | null) {
  if (!key || !bucket) return;

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export function getPublicImageUrl(key: string | null): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (cloudfrontUrl) return `${cloudfrontUrl}/${key}`;
  if (bucket) {
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
  return null;
}

export async function getSignedImageUrl(key: string | null) {
  if (!key || !bucket) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(getClient(), command, { expiresIn: 3600 });
}

export function productImageKey(filename: string) {
  return `products/${filename}`;
}
