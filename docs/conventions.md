# Convenções e Regras do Projeto

Este documento define os padrões que devem ser seguidos ao contribuir com o projeto. Estas regras são importantes para a IA do Cursor seguir em comandos futuros.

---

## Estrutura de código

### Organização de módulos

- Cada domínio tem seu próprio módulo NestJS em `src/<domain>/`.
- DTOs ficam em `src/<domain>/dto/`.
- Cada módulo contém: `*.module.ts`, `*.service.ts`, `*.controller.ts` (quando expõe rotas).
- Testes ficam ao lado do arquivo testado: `*.service.spec.ts`.

### Nomenclatura de arquivos

- **kebab-case** para nomes de arquivo: `create-report.dto.ts`, `jwt-auth.guard.ts`.
- Sufixos obrigatórios: `.module.ts`, `.service.ts`, `.controller.ts`, `.guard.ts`, `.strategy.ts`, `.decorator.ts`, `.dto.ts`, `.spec.ts`.

### Nomenclatura TypeScript

- Classes: **PascalCase** — `ReportsService`, `CreateReportDto`, `JwtAuthGuard`.
- Variáveis e funções: **camelCase**.
- Constantes/enums de valor: **UPPER_SNAKE_CASE** — `DATABASE_TOKEN`, `IS_PUBLIC_KEY`, `ROLES_KEY`.
- Tokens de injeção: `string` para DATABASE_TOKEN, `Symbol` para STORAGE_SERVICE.

---

## Banco de dados

- Schema Drizzle em `src/db/schema.ts`. Não espalhar definições de tabela em outros arquivos.
- Nomes de tabela: **plural, snake_case** — `users`, `reports`.
- Nomes de coluna: **snake_case** — `user_id`, `created_at`, `image_url`.
- Propriedades TypeScript (camelCase) são mapeadas para colunas snake_case pelo Drizzle: `userId` → `user_id`.
- IDs são **text** com `randomUUID()` como default (não autoincrement).
- Sempre incluir `created_at` com `defaultNow()`. Para tabelas editáveis, incluir `updated_at`.
- Ao alterar o schema, rodar `npm run db:generate` para gerar a migration.

---

## Autenticação e autorização

- **Todas as rotas são protegidas por JWT por padrão** (guard global `JwtAuthGuard`).
- Rotas públicas devem usar `@Public()`.
- Para controle por role, usar `@UseGuards(RolesGuard)` + `@Roles('ADMIN')` na rota.
- O objeto `request.user` contém: `{ id, email, role }`.
- Usar `@CurrentUser('id')` para extrair o ID do usuário logado, `@CurrentUser('role')` para o role.
- Nunca confiar em dados do cliente para identificar o usuário — sempre extrair do JWT.

---

## Validação

- DTOs usam `class-validator` com decorators (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, etc.).
- `ValidationPipe` com `whitelist: true` e `transform: true` é global — propriedades não declaradas no DTO são removidas automaticamente.
- DTOs devem ter `@ApiProperty()` para documentação Swagger.

---

## Storage

- Nunca usar S3Client diretamente em services. Injetar `STORAGE_SERVICE` (interface `StorageService`).
- A escolha entre MinIO e S3 é feita pela variável `STORAGE_PROVIDER` — o código de negócio não deve saber qual adapter está em uso.
- Chaves de arquivos seguem o padrão: `reports/{uuid}.{ext}`.

---

## IA

- O serviço de IA (`AiService`) sempre retorna um resultado, mesmo em caso de falha (fallback).
- O response do Gemini é validado com Zod. Se o parse falhar, conta como tentativa falha.
- Máximo de 3 tentativas antes de acionar o fallback.
- O prompt pede resposta em JSON puro, sem markdown, sem explicações.

---

## API

- Todos os controllers usam `@ApiTags()` e `@ApiBearerAuth()` para Swagger.
- Respostas de erro usam exceções NestJS padrão: `NotFoundException`, `ForbiddenException`, `BadRequestException`, `UnauthorizedException`, `ConflictException`.
- Mensagens de erro em **português**.

---

## Docker

- Dockerfile é multi-stage (deps → build → production).
- `docker-compose.yml` para ambiente local com PostgreSQL, MinIO e API.
- Variáveis que mudam entre local e Docker (como URLs de conexão) são overridden no `environment` do docker-compose, não no `.env`.

---

## Environment

- `.env` contém os valores para desenvolvimento **local** (fora do Docker).
- `.env.example` é o template com valores de exemplo — manter sincronizado.
- Nunca commitar `.env` com credenciais reais. O `.gitignore` já exclui `.env`.
- Usar `config.getOrThrow<string>('VAR')` para variáveis obrigatórias.
- Usar `config.get<string>('VAR', 'default')` para variáveis opcionais com fallback.
