import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { STORAGE_SERVICE, StorageService } from '../storage/storage.interface';

@Injectable()
export class UploadService {
  constructor(
    @Inject(STORAGE_SERVICE) private storage: StorageService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `reports/${randomUUID()}.${ext}`;
    return this.storage.upload(file.buffer, key, file.mimetype);
  }
}
