# Banco de Dados

## ORM

Drizzle ORM com driver `postgres` (postgres.js). Schema definido em `src/db/schema.ts`.

## Enums

| Enum | Valores |
|------|---------|
| `role` | `USER`, `ADMIN` |
| `report_status` | `NA_FILA`, `EM_TRIAGEM`, `EM_PROGRESSO`, `CONCLUIDO`, `NEGADO` |
| `priority` | `BAIXA`, `MEDIA`, `ALTA` |

## Tabelas

### users

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | text | PK, default `randomUUID()` |
| `name` | text | NOT NULL |
| `email` | text | NOT NULL, UNIQUE |
| `password` | text | NOT NULL (bcrypt hash) |
| `role` | role enum | NOT NULL, default `USER` |
| `created_at` | timestamp | NOT NULL, default `now()` |

### reports

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | text | PK, default `randomUUID()` |
| `title` | text | NOT NULL |
| `description` | text | NOT NULL |
| `location` | text | NOT NULL |
| `image_url` | text | nullable |
| `category` | text | nullable (preenchido pela IA) |
| `priority` | priority enum | nullable (preenchido pela IA) |
| `technical_summary` | text | nullable (preenchido pela IA) |
| `status` | report_status enum | NOT NULL, default `NA_FILA` |
| `user_id` | text | NOT NULL, FK → `users.id` |
| `created_at` | timestamp | NOT NULL, default `now()` |
| `updated_at` | timestamp | NOT NULL, default `now()` |

## Migrations

Gerenciadas pelo Drizzle Kit. Os arquivos SQL ficam em `drizzle/`.

```bash
npm run db:generate   # gera migration a partir do schema
npm run db:migrate    # aplica migrations pendentes
npm run db:seed       # cria usuário admin (adm@adm.com / admin123)
```

## Seed

O seed (`src/db/seed.ts`) cria um usuário administrador caso não exista:

| Campo | Valor |
|-------|-------|
| name | Administrador |
| email | adm@adm.com |
| password | admin123 |
| role | ADMIN |
