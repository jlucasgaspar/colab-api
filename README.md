# Colab Zeladoria IA — API

API back-end para gestão inteligente de solicitações urbanas. Cidadãos registram problemas da cidade e uma IA (Google Gemini) classifica automaticamente cada solicitação por categoria, prioridade e gera um resumo técnico.

## Stack

NestJS · TypeScript · PostgreSQL · Drizzle ORM · Passport JWT · Google Gemini · AWS S3 / MinIO · Docker

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) e Docker Compose
- Uma chave da [API do Gemini](https://aistudio.google.com/apikey) (free tier)

## Setup rápido

### 1. Clone e instale

```bash
git clone <repo-url>
cd colab-api
npm install
```

### 2. Configure o ambiente

Copie o `.env.example` e preencha sua chave do Gemini:

```bash
cp .env.example .env
```

Edite o `.env` e substitua o valor de `GEMINI_API_KEY`:

```env
GEMINI_API_KEY=sua-chave-aqui
```

As demais variáveis já vêm configuradas para uso local com Docker.

### 3. Inicialize o banco

Este comando sobe o PostgreSQL via Docker, gera as migrations, aplica no banco e cria o usuário admin:

```bash
npm run db:init
```

### 4. Rode a API

**Opção A — Docker Compose (recomendado):**

Sobe PostgreSQL + MinIO + API em containers:

```bash
docker compose up --build
```

**Opção B — Desenvolvimento local:**

Com o banco já rodando (via `npm run db:init`), rode a API diretamente:

```bash
npm run start:dev
```

## URLs

| Serviço | URL |
|---------|-----|
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |
| MinIO Console | http://localhost:9001 (login: `minio` / `minio123`) |

## Usuário admin (seed)

| Campo | Valor |
|-------|-------|
| Email | `adm@adm.com` |
| Senha | `admin123` |
| Role | `ADMIN` |

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run start:dev` | API em modo watch |
| `npm run build` | Build de produção |
| `npm run start:prod` | Roda o build |
| `npm run db:init` | Setup completo do banco (Docker + migrations + seed) |
| `npm run db:generate` | Gera migration a partir do schema |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run db:seed` | Cria usuário admin |
| `npm test` | Roda os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:cov` | Testes com cobertura |

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string do PostgreSQL |
| `JWT_SECRET` | Sim | Secret para assinar tokens JWT |
| `GEMINI_API_KEY` | Sim | Chave da API do Google Gemini |
| `STORAGE_PROVIDER` | Não | `minio` (padrão) ou `s3` |
| `STORAGE_ENDPOINT` | Sim (MinIO) | URL do MinIO (ex: `http://localhost:9000`) |
| `STORAGE_PUBLIC_URL` | Não | URL pública para acessar arquivos (default: `STORAGE_ENDPOINT`) |
| `STORAGE_ACCESS_KEY` | Sim | Access key do S3/MinIO |
| `STORAGE_SECRET_KEY` | Sim | Secret key do S3/MinIO |
| `STORAGE_REGION` | Sim | Região (ex: `us-east-1`) |
| `STORAGE_BUCKET` | Sim | Nome do bucket |
| `PORT` | Não | Porta da API (padrão: `3001`) |
| `FRONTEND_URL` | Não | URL do front-end para CORS (padrão: `http://localhost:3000`) |

## Produção

Para usar AWS S3 em vez do MinIO, ajuste no `.env`:

```env
STORAGE_PROVIDER=s3
STORAGE_ACCESS_KEY=sua-aws-access-key
STORAGE_SECRET_KEY=sua-aws-secret-key
STORAGE_REGION=us-east-1
STORAGE_BUCKET=seu-bucket
```

## Documentação detalhada

- [Visão geral](docs/overview.md)
- [Arquitetura e módulos](docs/architecture.md)
- [Rotas da API](docs/api-routes.md)
- [Banco de dados](docs/database.md)
- [Convenções e regras](docs/conventions.md)
