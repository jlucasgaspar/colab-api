# Arquitetura e Módulos

## Módulos NestJS

```
AppModule
├── ConfigModule          (global — carrega .env)
├── DatabaseModule        (global — Drizzle + PostgreSQL)
├── StorageModule         (global — S3 ou MinIO por env)
├── AuthModule            (Passport, JWT, guards)
│   └── UsersModule
├── ReportsModule         (CRUD + triagem IA)
│   └── AiModule
└── UploadModule          (upload de imagens via storage)
```

### DatabaseModule (`src/db/`)

- Provider `DATABASE_TOKEN` — instância Drizzle criada via `createDrizzle(DATABASE_URL)`.
- Global: disponível em toda a aplicação sem re-importar.
- Driver: `postgres` (postgres.js).

### StorageModule (`src/storage/`)

Abstração para armazenamento de arquivos. A interface `StorageService` define um método:

```typescript
interface StorageService {
  upload(buffer: Buffer, key: string, contentType: string): Promise<string>;
}
```

O módulo usa uma factory que seleciona o adapter com base em `STORAGE_PROVIDER`:

| Valor | Adapter | Uso |
|-------|---------|-----|
| `minio` (padrão) | `MinioStorageService` | Desenvolvimento local |
| `s3` | `S3StorageService` | Produção (AWS) |

O `MinioStorageService` cria o bucket automaticamente na inicialização e aplica uma policy de leitura pública.

### AuthModule (`src/auth/`)

- **JwtAuthGuard** — guard global (registrado como `APP_GUARD` no `AppModule`). Todas as rotas são protegidas por padrão.
- **@Public()** — decorator que desativa o guard JWT para a rota (usado em register e login).
- **RolesGuard** — guard aplicado por rota com `@UseGuards(RolesGuard)` + `@Roles('ADMIN')`.
- **JwtStrategy** — extrai `sub`, `email`, `role` do token e injeta como `request.user = { id, email, role }`.
- **JWT expira em 1 dia** (`signOptions: { expiresIn: '1d' }`).

### AiModule (`src/ai/`)

- Usa o SDK `@google/generative-ai` com o modelo `gemini-2.5-flash-lite`.
- Envia prompt de triagem e espera JSON com `category`, `priority` e `technicalSummary`.
- Validação do response com **Zod**.
- Retry: até 3 tentativas. Se todas falharem, retorna um fallback com `category: 'Outros'`, `priority: 'MEDIA'`.

### ReportsModule (`src/reports/`)

- `create` — triagem automática via `AiService` + insert no banco.
- `findMyReports` — retorna reports do usuário logado.
- `findAll` — admin only, retorna todos os reports.
- `findOne` — retorna um report por ID. Se o usuário não é ADMIN e não é dono do report, retorna 403.
- `updateStatus` — admin only, atualiza o status de um report.

### UploadModule (`src/upload/`)

- `POST /upload/image` — aceita multipart/form-data, campo `file`.
- Limite: 10MB, apenas `image/*`.
- Gera key no formato `reports/{uuid}.{ext}` e delega ao `StorageService`.

## Injeção de dependência

| Token | Tipo | Módulo |
|-------|------|--------|
| `DATABASE_TOKEN` (string) | `Database` (Drizzle) | DatabaseModule |
| `STORAGE_SERVICE` (Symbol) | `StorageService` | StorageModule |

Ambos são globais — qualquer service pode injetá-los via `@Inject(TOKEN)`.

## Docker Compose

| Serviço | Imagem | Portas | Função |
|---------|--------|--------|--------|
| `db` | postgres:16-alpine | 5432 | Banco de dados |
| `minio` | minio/minio | 9000 (API), 9001 (console) | Storage local S3-compatível |
| `api` | build local | 3001 | API NestJS |

O serviço `api` override `DATABASE_URL`, `STORAGE_ENDPOINT` e `STORAGE_PUBLIC_URL` para usar os hostnames internos do Docker (`db`, `minio`).
