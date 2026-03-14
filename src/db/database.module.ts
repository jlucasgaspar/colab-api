import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDrizzle } from './index';

export const DATABASE_TOKEN = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        return createDrizzle(url);
      },
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
