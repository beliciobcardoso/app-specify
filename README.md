# Jogo de Damas Completo

Sistema completo de jogo de Damas (regras brasileiras) com três modos: local, online e contra Bot (IA).

## 🎯 Features

- ✅ **Jogo Local**: Dois jogadores no mesmo dispositivo
- ✅ **Jogo Online**: Partidas em tempo real via WebSocket com salas e espectadores
- ✅ **Jogo vs Bot**: 3 níveis de dificuldade (Fácil, Médio, Difícil)
- ✅ **Salvar/Carregar**: Persistência de partidas para usuários autenticados
- ✅ **Regras Brasileiras**: Captura obrigatória, Lei da Maioria, capturas bidirecionais
- ✅ **Modo Espectador**: Assista partidas online em tempo real

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Linguagem**: TypeScript 5+ (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better-Auth
- **Real-time**: Socket.io
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library

## 🏗️ Arquitetura

- **Clean Architecture**: Lógica de negócio desacoplada em `src/core/`
- **Repository Pattern**: Abstrações de dados em `core/application/ports/`
- **Domain-Driven Design**: Entidades e serviços de domínio em `core/domain/`

## 📋 Pré-requisitos

- Node.js 20+
- Docker e Docker Compose (para PostgreSQL)
- npm ou yarn

## 🚀 Setup Rápido

```bash
# 1. Clonar repositório
git clone <repo-url>
cd app-specify

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Subir PostgreSQL via Docker
docker-compose up -d

# 5. Executar migrations Prisma
npx prisma migrate dev

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📚 Documentação Completa

Consulte [`specs/001-jogo-damas/quickstart.md`](specs/001-jogo-damas/quickstart.md) para instruções detalhadas de setup e desenvolvimento.

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes unitários (core/)
npm run test:unit

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

## 📖 Documentação do Projeto

- **Especificação**: [`specs/001-jogo-damas/spec.md`](specs/001-jogo-damas/spec.md)
- **Plano de Implementação**: [`specs/001-jogo-damas/plan.md`](specs/001-jogo-damas/plan.md)
- **Modelo de Dados**: [`specs/001-jogo-damas/data-model.md`](specs/001-jogo-damas/data-model.md)
- **Contratos de API**: [`specs/001-jogo-damas/contracts/`](specs/001-jogo-damas/contracts/)

## 🎮 Como Jogar

### Modo Local
1. Acesse `/game/local`
2. Clique em peças para movê-las
3. Alterne turnos entre jogadores

### Modo Online
1. Jogador 1: Crie uma sala → compartilhe código
2. Jogador 2: Entre com código
3. Espectadores: Entre com mesmo código após 2 jogadores ativos

### Modo Bot
1. Acesse `/game/bot`
2. Selecione dificuldade (Fácil/Médio/Difícil)
3. Escolha sua cor (Claro/Escuro)

## 🔐 Autenticação

- Autenticação gerenciada via Better-Auth
- Necessária para: salvar/carregar partidas, criar salas online
- Modos local e bot funcionam sem login

## 📄 Licença

MIT

## 👥 Contribuindo

Consulte [`CONTRIBUTING.md`](CONTRIBUTING.md) para diretrizes de contribuição.
