import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as bcrypt from 'bcrypt';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client);

  const email = process.env.ADMIN_EMAIL || 'adm@adm.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    console.log(`Admin user ${email} already exists`);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name: 'Administrador',
      email,
      password: hashed,
      role: 'ADMIN',
    });
    console.log(`Admin user ${email} created successfully`);
  }

  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
