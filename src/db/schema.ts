import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

export const reportStatusEnum = pgEnum('report_status', [
  'NA_FILA',
  'EM_TRIAGEM',
  'EM_PROGRESSO',
  'CONCLUIDO',
  'NEGADO',
]);

export const priorityEnum = pgEnum('priority', ['BAIXA', 'MEDIA', 'ALTA']);

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  imageUrl: text('image_url'),
  category: text('category'),
  priority: priorityEnum('priority'),
  technicalSummary: text('technical_summary'),
  status: reportStatusEnum('status').default('NA_FILA').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
