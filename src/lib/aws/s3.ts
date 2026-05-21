import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function isS3Configured() {
  const key = process.env.AWS_ACCESS_KEY_ID;
  return key && key !== "placeholder" && key.length > 5;
}

export function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "placeholder",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "placeholder",
    },
  });
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!isS3Configured()) {
    throw new Error("AWS S3 is not configured. Set AWS_ACCESS_KEY_ID in .env");
  }
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  if (!isS3Configured()) return;
  const s3 = getS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    })
  );
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (!isS3Configured()) return "";
  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
