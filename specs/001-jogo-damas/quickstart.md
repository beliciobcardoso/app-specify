# Quick Start Guide: Jogo de Damas

**Feature**: Jogo de Damas | **Date**: 2025-11-08 | **Plan**: [plan.md](./plan.md)

Este guia fornece instruções passo a passo para configurar o ambiente de desenvolvimento e executar o Jogo de Damas localmente.

---

## Prerequisites

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v20+ recomendado) - [Download](https://nodejs.org/)
- **npm** ou **pnpm** (pnpm recomendado para monorepos)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (opcional, mas recomendado) - [Download](https://code.visualstudio.com/)

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd app-specify
```

---

## Step 2: Checkout Feature Branch

```bash
git checkout 001-jogo-damas
```

---

## Step 3: Install Dependencies

```bash
npm install
# ou
pnpm install
```

---

## Step 4: Configure Environment Variables

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Preencha as variáveis obrigatórias:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/checkers_db?schema=public"

# Better-Auth
BETTER_AUTH_SECRET="your-secret-key-here-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# WebSocket (optional, defaults to 3001)
WEBSOCKET_PORT=3001

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Gerar `BETTER_AUTH_SECRET`**:
```bash
openssl rand -base64 32
```

---

## Step 5: Start PostgreSQL (Docker)

Inicie o banco de dados PostgreSQL via Docker Compose:

```bash
docker-compose up -d
```

**Verificar se o container está rodando**:
```bash
docker ps
```

Você deve ver algo como:
```
CONTAINER ID   IMAGE         PORTS                    NAMES
abc123def456   postgres:15   0.0.0.0:5432->5432/tcp   app-specify-postgres
```

---

## Step 6: Run Prisma Migrations

Aplique as migrations do Prisma para criar as tabelas no banco:

```bash
npx prisma migrate dev --name init
```

**Seed data** (opcional, se houver arquivo `seed.ts`):
```bash
npx prisma db seed
```

**Verificar schema no Prisma Studio** (opcional):
```bash
npx prisma studio
```

Abra http://localhost:5555 para visualizar dados no banco.

---

## Step 7: Generate Prisma Client

Gere o Prisma Client (tipos TypeScript para acesso ao banco):

```bash
npx prisma generate
```

---

## Step 8: Run Development Server (Next.js)

Inicie o servidor de desenvolvimento Next.js:

```bash
npm run dev
# ou
pnpm dev
```

Abra http://localhost:3000 no navegador.

**Você deve ver**:
- Landing page do Jogo de Damas
- Opções para iniciar jogo local, online ou vs Bot

---

## Step 9: Run WebSocket Server (Separate Terminal)

Em um novo terminal, inicie o servidor WebSocket para modo online:

```bash
npm run websocket:dev
# ou (se não houver script dedicado)
npx tsx src/infrastructure/websocket/server.ts
```

**Verificar conexão**:
- Console deve mostrar: `WebSocket server running on port 3001`

---

## Step 10: Test Local Game

1. Acesse http://localhost:3000
2. Clique em "Jogo Local"
3. Execute movimentos no tabuleiro
4. Verifique:
   - Feedback visual para movimentos válidos/inválidos (FR-016)
   - Captura obrigatória aplicada (FR-003)
   - Promoção a Dama funciona (FR-006)
   - Vitória detectada corretamente (FR-008)

---

## Step 11: Test Online Game (Two Browser Tabs)

### Tab 1 (Player 1):
1. Clique em "Criar Sala"
2. Copie o código de 6 caracteres exibido

### Tab 2 (Player 2):
1. Clique em "Entrar em Sala"
2. Cole o código da sala
3. Confirme entrada

### Verificações:
- Ambos os players veem o tabuleiro sincronizado (SC-006)
- Movimentos propagam em <1s (FR-012)
- Desconexão de um player aciona janela de reconexão (FR-027)

---

## Step 12: Test Bot Game

1. Clique em "Jogar vs Bot"
2. Selecione dificuldade (Easy, Medium, Hard)
3. Escolha sua cor (Light ou Dark)
4. Execute jogadas e observe:
   - Bot responde em <3s (SC-007)
   - Bot respeita captura obrigatória (FR-013)

---

## Common Issues & Troubleshooting

### Issue 1: Database Connection Error

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
```bash
# Verifique se Docker está rodando
docker ps

# Reinicie container PostgreSQL
docker-compose restart

# Verifique logs
docker logs app-specify-postgres
```

---

### Issue 2: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
```

---

### Issue 3: Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Mude a porta no .env
echo "PORT=3001" >> .env

# Ou mate o processo na porta 3000
lsof -ti:3000 | xargs kill -9
```

---

### Issue 4: WebSocket Connection Failed

**Error**: `WebSocket connection to 'ws://localhost:3001' failed`

**Solution**:
1. Certifique-se de que o servidor WebSocket está rodando (`npm run websocket:dev`)
2. Verifique `WEBSOCKET_PORT` no `.env`
3. Verifique logs do servidor WebSocket para erros

---

### Issue 5: Better-Auth Login Not Working

**Error**: `Invalid credentials` ou redirecionamento falhando

**Solution**:
1. Verifique `BETTER_AUTH_SECRET` no `.env` (min 32 caracteres)
2. Limpe cookies do navegador (Ctrl+Shift+Del)
3. Reinicie servidor Next.js
4. Verifique logs do servidor para erros de autenticação

---

## Development Workflow

### Running Tests

**Unit Tests** (core business logic):
```bash
npm run test:unit
```

**Integration Tests** (Server Actions, repositories):
```bash
npm run test:integration
```

**All Tests**:
```bash
npm test
```

**Coverage Report**:
```bash
npm run test:coverage
```

---

### Linting & Type Checking

**ESLint**:
```bash
npm run lint
```

**TypeScript Type Check**:
```bash
npm run type-check
```

---

### Database Management

**Create New Migration** (após modificar `schema.prisma`):
```bash
npx prisma migrate dev --name <migration-name>
```

**Reset Database** (⚠️ deleta todos os dados):
```bash
npx prisma migrate reset
```

**View Database** (Prisma Studio):
```bash
npx prisma studio
```

---

### Useful Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:unit": "jest --testPathPattern=tests/unit",
  "test:integration": "jest --testPathPattern=tests/integration",
  "test:coverage": "jest --coverage",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "websocket:dev": "tsx watch src/infrastructure/websocket/server.ts"
}
```

---

## Architecture Overview (Quick Reference)

```
src/
├── app/               # Next.js App Router (UI + Server Actions)
├── core/              # Business Logic (framework-agnostic)
│   ├── domain/        # Entities, Value Objects, Domain Services
│   └── application/   # Use Cases, DTOs, Repository Interfaces
├── infrastructure/    # Framework-specific implementations
│   ├── auth/          # Better-Auth config
│   ├── database/      # Prisma + Repositories
│   ├── websocket/     # WebSocket server
│   └── validation/    # Zod schemas
└── shared/            # Shared utilities
```

**Key Principles**:
- **Clean Architecture**: `core/` não importa nada de `app/` ou `infrastructure/`
- **Repository Pattern**: Prisma encapsulado em repositórios
- **Type Safety**: TypeScript strict mode, sem `any`
- **Security**: Validação no servidor (Zod), Better-Auth para autenticação

---

## Next Steps

Após configurar o ambiente:

1. **Explore o código**:
   - Leia `core/domain/services/GameEngine.ts` (lógica central do jogo)
   - Veja `app/_actions/game-actions.ts` (Server Actions)
   - Entenda `infrastructure/database/repositories/` (Repository Pattern)

2. **Execute testes**:
   - `npm run test:unit` para testar lógica de jogo
   - `npm run test:integration` para testar Server Actions

3. **Implemente uma feature**:
   - Consulte `tasks.md` (criado por `/speckit.tasks`)
   - Siga a ordem de prioridade (P1 → P2 → P3 → P4)

4. **Contribua**:
   - Crie branch para sua feature
   - Siga convenções de commit (Conventional Commits)
   - Abra Pull Request com descrição detalhada

---

## Additional Resources

- **Documentação Oficial**:
  - [Next.js App Router](https://nextjs.org/docs/app)
  - [Prisma ORM](https://www.prisma.io/docs)
  - [Better-Auth](https://www.better-auth.com/docs)
  - [Socket.io](https://socket.io/docs/v4/)

- **Projeto**:
  - [Constituição](../../.specify/memory/constitution.md) - Princípios arquiteturais
  - [Especificação](./spec.md) - 32 requisitos funcionais
  - [Plano de Implementação](./plan.md) - Arquitetura detalhada
  - [Data Model](./data-model.md) - Prisma schema

- **Suporte**:
  - Issues: <repository-issues-url>
  - Slack/Discord: <community-link>

---

**Dúvidas?** Consulte a [documentação completa](./plan.md) ou abra uma issue no repositório.

**Happy Coding! 🎮♟️**
