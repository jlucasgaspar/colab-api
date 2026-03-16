# Colab Zeladoria IA — Visão Geral

## O que é

API back-end do **Colab Zeladoria IA**, uma plataforma de gestão urbana onde cidadãos registram problemas da cidade (buracos, lâmpadas queimadas, lixo acumulado, etc.) e uma IA classifica automaticamente cada solicitação por categoria, prioridade e gera um resumo técnico para o gestor público.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node 20 (Alpine) |
| Framework | NestJS 11 |
| Linguagem | TypeScript 5 |
| Banco de dados | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Autenticação | Passport + JWT (`@nestjs/jwt`) |
| Validação | class-validator + class-transformer |
| IA | Google Gemini (`gemini-2.5-flash-lite`) via `@google/generative-ai` |
| Storage | AWS S3 (produção) / MinIO (local), via `@aws-sdk/client-s3` |
| Upload | Multer |
| Documentação API | Swagger (`@nestjs/swagger`) em `/api/docs` |
| Testes | Jest + ts-jest |
| Containers | Docker + Docker Compose |

## Estrutura de diretórios

```
src/
├── ai/                  # Triagem automática com Gemini
├── auth/                # Registro, login, JWT, guards
│   ├── dto/
│   ├── guards/
│   └── strategies/
├── common/
│   └── decorators/      # @Public, @Roles, @CurrentUser
├── db/                  # Drizzle schema, migrations, seed
├── reports/             # CRUD de solicitações urbanas
│   └── dto/
├── storage/             # Abstração de storage (S3 / MinIO)
├── upload/              # Upload de imagens
├── users/               # Serviço de usuários
├── app.module.ts        # Módulo raiz
└── main.ts              # Bootstrap
```

## Fluxo principal

1. Cidadão se registra (`POST /auth/register`) e recebe um JWT.
2. Cidadão faz upload de uma foto (`POST /upload/image`) — retorna a URL pública.
3. Cidadão cria uma solicitação (`POST /reports`) com título, descrição, localização e (opcionalmente) a URL da foto.
4. A API envia título + descrição para o **Gemini**, que retorna: `category`, `priority` e `technicalSummary`.
5. O report é salvo no banco com os dados do cidadão + os dados gerados pela IA.
6. O admin acessa o painel, visualiza todos os reports (`GET /reports`) e atualiza o status (`PATCH /reports/:id/status`).

## Papéis

| Role | Capacidades |
|------|-------------|
| `USER` | Criar reports, ver seus próprios reports, ver um report específico (se for dono) |
| `ADMIN` | Tudo que o USER faz + listar todos os reports + atualizar status + ver qualquer report |
