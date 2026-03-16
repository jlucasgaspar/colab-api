import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { StorageService } from './storage.interface';

@Injectable()
export class MinioStorageService implements StorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly bucketReady: Promise<void>;

  constructor(private config: ConfigService) {
    const endpoint = this.config.getOrThrow<string>('STORAGE_ENDPOINT');
    this.bucket = this.config.getOrThrow<string>('STORAGE_BUCKET');
    this.publicUrl = this.config.get<string>('STORAGE_PUBLIC_URL', endpoint);

    this.s3 = new S3Client({
      region: this.config.getOrThrow<string>('STORAGE_REGION'),
      endpoint,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('STORAGE_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow<string>('STORAGE_SECRET_KEY'),
      },
      forcePathStyle: true,
    });

    this.logger.log(`Using MinIO storage at ${endpoint}`);
    this.bucketReady = this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" already exists`);
    } catch {
      this.logger.log(`Creating bucket "${this.bucket}"...`);
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
    } finally {
      await this.setPublicReadPolicy();
    }
  }

  private async setPublicReadPolicy(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };

    await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(policy),
      }),
    );
    this.logger.log(`Public read policy set on bucket "${this.bucket}"`);
  }

  async upload(buffer: Buffer, key: string, contentType: string): Promise<string> {
    await this.bucketReady;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return `${this.publicUrl}/${this.bucket}/${key}`;
  }
}
