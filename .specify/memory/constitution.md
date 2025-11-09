<!--
Sync Impact Report - Version 1.2.0
════════════════════════════════════════════════════════════════════════════════
Version Change: 1.1.0 → 1.2.0
Bump Rationale: MINOR - obrigação explícita de Better-Auth delegar IDs ao Prisma

Modified Principles:
  - N/A (ajuste em requisitos de stack)

Modified Sections:
  - Technology Stack Requirements → Authentication (detalha advanced.database.generateId)

Added Sections:
  - N/A

Removed Sections:
  - N/A

Templates Requiring Updates:
  ✅ plan-template.md - Constituição Check agora inclui verificação Better-Auth
  ✅ spec-template.md - comentários de requisitos reforçam delegação de IDs
  ✅ tasks-template.md - fase fundamental cita configuração Better-Auth

Follow-up TODOs:
  - Nenhum

═══════════════════════════════════════════════════════════════════════════════
-->

# App-Specify Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)

**Regra de Dependência Inquebrável**: O código DEVE seguir a Clean Architecture com separação rigorosa de responsabilidades. A lógica de negócio ("core": `domain` + `application/use-cases`) DEVE ser pura e totalmente agnóstica de frameworks externos (Next.js, Prisma, UI).

- O "core" NÃO PODE importar nada de `app/` ou bibliotecas de infraestrutura
- Dependências DEVEM fluir de fora para dentro (UI → Application → Domain)
- Violações desta regra DEVEM ser rejeitadas em code review

**Rationale**: Garante testabilidade, manutenibilidade e independência de frameworks. Permite trocar infraestrutura sem afetar regras de negócio.

### II. Documentation-First & Type Safety (NON-NEGOTIABLE)

**TypeScript Strict Mode Obrigatório**: Todo código DEVE ser escrito em TypeScript com `strict: true` no `tsconfig.json`.

- Uso de `any` é PROIBIDO (exceções raras DEVEM ser justificadas e documentadas)
- Tipos complexos e APIs públicas DEVEM ter documentação JSDoc clara
- Interfaces DEVEM ser preferidas sobre tipos concretos para abstração

**Rationale**: Previne erros em tempo de desenvolvimento, serve como documentação viva e facilita refatoração segura.

### III. Repository Pattern & Dependency Inversion (SOLID)

**Abstração de Infraestrutura**: Prisma ORM DEVE ser sempre encapsulado por trás de interfaces (Repository Pattern) definidas na camada de aplicação.

- Camada de aplicação DEVE definir interfaces de repositórios
- Camada de infraestrutura DEVE implementar essas interfaces usando Prisma
- Injeção de dependência DEVE ser usada para fornecer implementações concretas
- Code da camada de domínio/aplicação NÃO PODE importar `@prisma/client` diretamente

**Rationale**: Princípio da Inversão de Dependência (SOLID). Permite trocar o ORM ou database sem alterar lógica de negócio. Facilita testes unitários com mocks.

### IV. Official Documentation as Single Source of Truth

**Aderência Estrita à Documentação Oficial**: Implementações DEVEM ser baseadas EXCLUSIVAMENTE na documentação oficial atualizada das frameworks (Next.js, Prisma, Better-Auth, Zod).

- Consultar servidores MCP (Model Context Protocol) quando disponíveis
- Consultar arquivos `LLMs.txt` fornecidos pelas bibliotecas (ex: Better-Auth)
- Validar contra múltiplas fontes de documentação para garantir precisão
- Código ou métodos obsoletos, incorretos ou "inventados" NÃO PODEM ser gerados
- A pasta `Docs/` no projeto DEVE ser consultada antes de qualquer implementação

**Rationale**: Evita bugs causados por APIs depreciadas, garante compatibilidade com versões atuais e segue melhores práticas recomendadas pela comunidade.

### V. Security-First Design

**Validação e Autorização no Servidor**: Toda validação de dados DEVE ocorrer no servidor. Regras de autorização do Better-Auth DEVEM ser aplicadas em Server Components e Route Handlers.

- Validação de entrada DEVE usar Zod em Server Actions ou Route Handlers
- Better-Auth DEVE ser usado para autenticação e autorização "headless"
- Credenciais de banco de dados DEVEM ser lidas EXCLUSIVAMENTE do arquivo `.env`
- Server Components DEVEM verificar permissões antes de renderizar conteúdo sensível
- Client Components NÃO PODEM conter lógica de autorização crítica

**Rationale**: Previne ataques de injeção, garante que regras de negócio sejam aplicadas de forma consistente e protege dados sensíveis.

### VI. React Component Design Patterns

**Composição e Separação de Responsabilidades**: Componentes React DEVEM seguir padrões de design claros, favorecendo composição e separação de estado da renderização.

- Lógica de estado (hooks) DEVE ser separada de componentes puros de UI
- Preferir composição de componentes sobre herança
- Client Components DEVEM ser marcados explicitamente com `"use client"`
- Server Components são padrão e DEVEM ser preferidos quando possível
- Props DEVEM ter tipos explícitos (TypeScript interfaces)

**Rationale**: Melhora reutilização, testabilidade e performance (Server Components reduzem JavaScript no cliente).

### VII. Test Coverage & Continuous Integration

**Testes Abrangentes e Automação**: Cobertura de testes unitários e de integração DEVE ser abrangente, com foco especial em lógica de negócio e integrações críticas.

- Testes unitários para lógica de negócio (domain e application layers) são OBRIGATÓRIOS
- Testes de integração para Server Actions e Route Handlers são OBRIGATÓRIOS
- Jest e React Testing Library DEVEM ser usados como ferramentas de teste
- CI (Continuous Integration) DEVE executar testes automaticamente em cada commit
- Coverage mínimo de 80% para código de lógica de negócio

**Rationale**: Previne regressões, garante qualidade contínua e permite refatoração confiante.

## Technology Stack Requirements

### Mandatory Technologies

**Frontend & API**:
- Next.js (App Router) - Versão mais recente estável
- React Server Components como padrão
- Client Components apenas quando necessário (interatividade)

**Database & ORM**:
- PostgreSQL - Rodando em container Docker (configuração via `.env`)
- Prisma ORM - Encapsulado via Repository Pattern
- Migrations DEVEM ser versionadas e aplicadas via `prisma migrate`
- IDs de usuário e demais chaves primárias DEVEM usar `@default(uuid())` no schema do Prisma,
  garantindo que Better-Auth confie na geração realizada pelo banco

**Authentication**:
- Better-Auth - Framework "headless" de autenticação
- Configuração DEVE seguir documentação oficial do Better-Auth
- Prisma Adapter DEVE ser usado para integração com PostgreSQL
- Campo `advanced.database.generateId` DEVE ser `false` para delegar criação de IDs ao Prisma

**Validation & Type Safety**:
- Zod - Validação de schemas no servidor
- TypeScript - Modo `strict` habilitado

**Testing**:
- Jest - Framework de testes
- React Testing Library - Testes de componentes
- Supertest (opcional) - Testes de API

### Prohibited Practices

- Uso de `any` em TypeScript (sem justificativa documentada)
- Importação direta de `@prisma/client` fora da camada de infraestrutura
- Lógica de negócio em componentes React ou Route Handlers
- Validação de dados apenas no cliente
- Credenciais hardcoded (DEVEM estar em `.env`)

## Development Workflow & Quality Gates

### Code Review Requirements

Todo código DEVE passar por revisão antes de merge, verificando:

1. **Clean Architecture Compliance**: Dependências fluem corretamente?
2. **Type Safety**: Sem uso de `any`? Tipos bem documentados?
3. **Abstraction**: Prisma encapsulado? Interfaces bem definidas?
4. **Security**: Validação no servidor? Autorização aplicada?
5. **Testing**: Testes unitários e de integração presentes?
6. **Documentation**: Código complexo documentado com JSDoc?

### Quality Gates (CI Pipeline)

Antes de aprovar um PR, os seguintes gates DEVEM passar:

- ✅ Build TypeScript sem erros (`npm run build`)
- ✅ Linting sem warnings (`npm run lint`)
- ✅ Todos os testes passam (`npm run test`)
- ✅ Coverage mínimo de 80% em lógica de negócio
- ✅ Sem vulnerabilidades críticas em dependências (`npm audit`)

### Architecture Decision Records (ADRs)

Decisões arquiteturais significativas DEVEM ser documentadas em `docs/adr/` seguindo o formato:

```
# ADR-###: [Título da Decisão]

## Status: [Proposed | Accepted | Deprecated | Superseded]

## Context
[Explicação do problema]

## Decision
[O que foi decidido]

## Consequences
[Implicações da decisão]
```

## Governance

### Amendment Procedure

Esta constituição PODE ser emendada seguindo o processo:

1. Proposta de emenda documentada com justificativa
2. Revisão por stakeholders principais
3. Atualização de templates dependentes (plan, spec, tasks)
4. Aprovação formal e bump de versão semântica
5. Comunicação de mudanças a todos os desenvolvedores

### Versioning Policy

Versão semântica (MAJOR.MINOR.PATCH):

- **MAJOR**: Mudanças incompatíveis com governança anterior (remoção/redefinição de princípios)
- **MINOR**: Novos princípios/seções ou expansões materiais de orientação
- **PATCH**: Clarificações, correções de texto, refinamentos não-semânticos

### Compliance Review

Todos os PRs DEVEM verificar conformidade com esta constituição. Complexidade DEVE ser justificada quando violar princípios (documentar em `plan.md` seção "Complexity Tracking").

### Runtime Development Guidance

Para orientações específicas de desenvolvimento em tempo de execução, consultar:
- `.github/prompts/speckit.constitution.prompt.md` - Atualização da constituição
- `.specify/templates/plan-template.md` - Planejamento de features
- `.specify/templates/spec-template.md` - Especificação de requisitos
- `.specify/templates/tasks-template.md` - Organização de tarefas

**Version**: 1.2.0 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-09
