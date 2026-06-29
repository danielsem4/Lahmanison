import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import type { FileStorage } from './storage';

/**
 * S3-compatible object storage. Works with AWS S3, Cloudflare R2, Backblaze B2,
 * MinIO, etc. — point S3_ENDPOINT at the provider (omit for AWS) and set
 * S3_FORCE_PATH_STYLE=true for MinIO / some self-hosted gateways.
 */
export class S3FileStorage implements FileStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const bucket = process.env['S3_BUCKET'];
    const accessKeyId = process.env['S3_ACCESS_KEY_ID'];
    const secretAccessKey = process.env['S3_SECRET_ACCESS_KEY'];
    if (!bucket) {
      throw new Error('S3_BUCKET is required for the s3 storage driver');
    }
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required for the s3 storage driver',
      );
    }

    this.bucket = bucket;
    const endpoint = process.env['S3_ENDPOINT'];
    this.client = new S3Client({
      region: process.env['S3_REGION'] ?? 'auto',
      ...(endpoint ? { endpoint } : {}),
      forcePathStyle: process.env['S3_FORCE_PATH_STYLE'] === 'true',
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async save(key: string, buffer: Buffer, contentType?: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  }

  async read(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    if (!response.Body) {
      throw new Error(`Empty object body for key: ${key}`);
    }
    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
