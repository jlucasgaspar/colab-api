import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../db/database.module';
import { Database } from '../db';
import { users } from '../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private db: Database) {}

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result[0] ?? null;
  }

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return result[0] ?? null;
  }

  async create(data: { name: string; email: string; password: string }) {
    const result = await this.db.insert(users).values(data).returning();
    return result[0];
  }
}
