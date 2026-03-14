import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `reports/${randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const region = this.config.getOrThrow<string>('AWS_REGION');
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
