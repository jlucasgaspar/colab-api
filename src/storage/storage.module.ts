import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_SERVICE } from './storage.interface';
import { S3StorageService } from './s3-storage.service';
import { MinioStorageService } from './minio-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('STORAGE_PROVIDER', 'minio');
        return provider === 's3'
          ? new S3StorageService(config)
          : new MinioStorageService(config);
      },
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
