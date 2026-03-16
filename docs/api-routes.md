# Rotas da API

Base URL: `http://localhost:3001`

Documentação Swagger: `http://localhost:3001/api/docs`

## Autenticação

Todas as rotas são protegidas por JWT (`Authorization: Bearer <token>`) exceto as marcadas como públicas.

---

## Auth

### POST /auth/register (pública)

Registra um novo usuário.

**Body:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response 201:**

```json
{
  "access_token": "eyJhbG...",
  "user": { "id": "uuid", "name": "João Silva", "email": "joao@email.com", "role": "USER" }
}
```

### POST /auth/login (pública)

**Body:**

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response 200:** mesmo formato do register.

### GET /auth/me

Retorna o perfil do usuário autenticado.

**Response 200:**

```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "USER"
}
```

---

## Reports

### POST /reports

Cria uma nova solicitação. A triagem por IA é executada automaticamente.

**Body:**

```json
{
  "title": "Buraco na calçada",
  "description": "Tem um buraco enorme na calçada da Rua das Flores, alguém pode se machucar.",
  "location": "Rua das Flores, 123 - Centro",
  "imageUrl": "http://localhost:9000/colab-uploads/reports/uuid.jpg"
}
```

**Response 201:** o report completo com `category`, `priority`, `technicalSummary` gerados pela IA.

### GET /reports/my

Retorna os reports do usuário autenticado, ordenados por data de criação (desc).

### GET /reports — `ADMIN` only

Retorna todos os reports do sistema.

### GET /reports/:id — `ADMIN` ou dono do report

Retorna um report específico. Se o usuário não for ADMIN e não for o criador do report, retorna **403 Forbidden**.

### PATCH /reports/:id/status — `ADMIN` only

Atualiza o status de um report.

**Body:**

```json
{
  "status": "EM_PROGRESSO"
}
```

**Status válidos:** `NA_FILA`, `EM_TRIAGEM`, `EM_PROGRESSO`, `CONCLUIDO`, `NEGADO`.

---

## Upload

### POST /upload/image

Upload de imagem via multipart/form-data.

- Campo: `file`
- Limite: 10 MB
- Tipos aceitos: `image/*`

**Response 201:**

```json
{
  "url": "http://localhost:9000/colab-uploads/reports/uuid.jpeg"
}
```
