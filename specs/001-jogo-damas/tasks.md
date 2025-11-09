# Tasks: Jogo de Damas Completo

**Input**: Design documents from `/specs/001-jogo-damas/`  
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organização**: Tarefas agrupadas por User Story para implementação e testes independentes.

**Revisão Obrigatória**: Após cada Fase de User Story, revisar conformidade com Constituição e Especificação. Solicitar feedback do desenvolvedor antes de avançar.

---

## Formato: `[ID] [P?] [Story] Descrição com caminho do arquivo`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User Story a qual pertence (US1, US2, US3, US4)
- Caminhos de arquivo exatos incluídos nas descrições

---

## Fase 1: Setup (Infraestrutura Compartilhada)

**Propósito**: Inicialização do projeto e estrutura básica

- [X] T001 Criar estrutura de diretórios conforme plan.md (src/app, src/core, src/infrastructure, src/shared, tests)
- [X] T002 Inicializar projeto Next.js 16+ com TypeScript strict mode e configurar `tsconfig.json`
- [X] T003 [P] Instalar dependências principais: React 19+, Next.js 16+, Prisma, Better-Auth, Zod, Tailwind CSS
- [X] T004 [P] Configurar ESLint e Prettier para TypeScript strict (sem uso de `any`)
- [X] T005 [P] Configurar Jest e React Testing Library em `tests/` com setup inicial
- [X] T006 Configurar variáveis de ambiente: criar `.env.example` com DATABASE_URL, BETTER_AUTH_SECRET, WEBSOCKET_PORT
- [X] T007 [P] Configurar Tailwind CSS em `src/app/globals.css` e `tailwind.config.ts`
- [X] T008 [P] Criar README.md do projeto com instruções de setup (referenciar quickstart.md)

**Estimativa Total Fase 1**: ~4 horas

---

## Fase 2: Foundational (Pré-requisitos Bloqueantes)

**Propósito**: Infraestrutura core que DEVE estar completa antes de QUALQUER User Story

**⚠️ CRÍTICO**: Nenhum trabalho de User Story pode começar até esta fase estar completa

- [X] T009 Configurar PostgreSQL via Docker: criar `docker-compose.yml` com serviço PostgreSQL
- [X] T010 Criar schema Prisma em `src/infrastructure/database/prisma/schema.prisma` baseado em data-model.md (9 models: User, Account, Session, VerificationToken, Game, Move, Room, RoomMember, GameStats)
- [X] T011 Executar `prisma migrate dev --name init` para criar primeira migration
- [X] T012 [P] Configurar Better-Auth em `src/infrastructure/auth/config.ts` com Prisma adapter
- [X] T013 [P] Criar middleware de autenticação em `src/infrastructure/auth/middleware.ts` para Server Components
- [X] T014 [P] Definir Value Objects em `src/core/domain/value-objects/`: Position.ts, PieceColor.ts, PieceType.ts, GameMode.ts, GameStatus.ts, PlayerType.ts, BotDifficulty.ts, RoomStatus.ts, RoomRole.ts, ConnectionStatus.ts
- [X] T015 [P] Definir entidades core em `src/core/domain/entities/`: Board.ts, Piece.ts, Player.ts, Game.ts, Move.ts, Room.ts
- [X] T016 [P] Definir interfaces de repositório em `src/core/application/ports/`: IGameRepository.ts, IUserRepository.ts, IRoomRepository.ts, IMoveRepository.ts, IBotService.ts, IWebSocketService.ts
- [X] T017 [P] Implementar PrismaGameRepository em `src/infrastructure/database/repositories/PrismaGameRepository.ts`
- [X] T018 [P] Implementar PrismaUserRepository em `src/infrastructure/database/repositories/PrismaUserRepository.ts`
- [X] T019 [P] Implementar PrismaRoomRepository em `src/infrastructure/database/repositories/PrismaRoomRepository.ts`
- [X] T020 [P] Implementar PrismaMoveRepository em `src/infrastructure/database/repositories/PrismaMoveRepository.ts`
- [X] T021 [P] Configurar Zod schemas base em `src/infrastructure/validation/schemas/`: move-schema.ts, room-schema.ts, game-schema.ts
- [X] T022 [P] Configurar structured logging em `src/infrastructure/logging/logger.ts` (Winston ou Pino)
- [X] T023 [P] Criar log-events.ts em `src/infrastructure/logging/` com eventos auditáveis (login, criação de sala, movimentos, capturas, vitórias, erros, reconexões, timeouts)
- [X] T024 [P] Configurar gerenciamento de environment em `src/infrastructure/config/env.ts` com validação type-safe
- [X] T025 [P] Criar componentes shared básicos em `src/app/_components/shared/`: Button.tsx, Modal.tsx, Spinner.tsx
- [X] T026 [P] Criar layout base em `src/app/layout.tsx` e Header/Footer components
- [X] T027 [P] Configurar rotas de autenticação Better-Auth em `src/app/api/auth/`
- [X] T028 Criar testes de integração para repositórios Prisma em `tests/integration/`: PrismaGameRepository.test.ts, PrismaUserRepository.test.ts

**Estimativa Total Fase 2**: ~16 horas

**Checkpoint**: Fundação pronta - implementação de User Stories pode começar em paralelo

---

## Fase 3: User Story 1 - Jogo Local para Dois Jogadores (Prioridade: P1) 🎯 MVP

**Objetivo**: Dois jogadores podem jogar Damas localmente no mesmo dispositivo, alternando turnos. Sistema exibe tabuleiro 8x8, valida movimentos (diagonal, casas escuras), aplica captura obrigatória e Lei da Maioria, promove peças a Damas, e detecta vitória/derrota/empate.

**Teste Independente**: Iniciar partida local → executar jogadas simples → testar captura obrigatória → testar Lei da Maioria → promover peça a Dama → verificar condição de vitória/empate.

### Implementação Domain Layer (Core)

- [X] T029 [P] [US1] Implementar MoveValidator em `src/core/domain/services/MoveValidator.ts` (validação de movimento diagonal, casas escuras, direção válida para peça comum vs Dama)
- [X] T030 [P] [US1] Implementar CaptureDetector em `src/core/domain/services/CaptureDetector.ts` (detectar capturas obrigatórias para peças comuns e Damas, incluindo capturas bidirecionais)
- [X] T031 [P] [US1] Implementar LeiDaMaioriaService em `src/core/domain/services/LeiDaMaioriaService.ts` (calcular todos os caminhos de captura possíveis, determinar caminho com maior número de capturas)
- [X] T032 [P] [US1] Implementar PromotionService em `src/core/domain/services/PromotionService.ts` (detectar quando peça comum atinge 8ª fileira, promover a Dama)
- [X] T033 [P] [US1] Implementar WinConditionChecker em `src/core/domain/services/WinConditionChecker.ts` (detectar vitória por captura total, empate por bloqueio mútuo com peças iguais, derrota por menor número de peças)
- [X] T034 [US1] Implementar GameEngine em `src/core/domain/services/GameEngine.ts` (orquestrar todos os serviços: validar movimento, aplicar captura obrigatória, promover Dama, verificar win condition) - depende de T029-T033

### Implementação Application Layer (Use Cases)

- [X] T035 [P] [US1] Criar DTOs em `src/core/application/dtos/`: ExecuteMoveDTO.ts, GameStateDTO.ts
- [X] T036 [US1] Implementar StartLocalGameUseCase em `src/core/application/use-cases/local/StartLocalGameUseCase.ts` (criar partida local, inicializar tabuleiro 8x8, posicionar 12 peças de cada cor nas 3 primeiras fileiras de casas escuras)
- [X] T037 [US1] Implementar ExecuteMoveUseCase em `src/core/application/use-cases/local/ExecuteMoveUseCase.ts` (chamar GameEngine para validar e executar jogada, atualizar estado do jogo, logar movimento) - depende de T034

### Implementação Presentation Layer (UI)

- [X] T038 [P] [US1] Criar componente Board em `src/app/_components/game/Board.tsx` (Client Component: renderizar tabuleiro 8x8 com cores alternadas, detectar cliques em peças/casas)
- [X] T039 [P] [US1] Criar componente Piece em `src/app/_components/game/Piece.tsx` (exibir peça com cor e tipo - comum ou Dama, aplicar estilos visuais diferenciados)
- [X] T040 [P] [US1] Criar componente MoveIndicator em `src/app/_components/game/MoveIndicator.tsx` (destacar movimentos válidos, indicar capturas obrigatórias visualmente)
- [X] T041 [P] [US1] Criar componente GameStatus em `src/app/_components/game/GameStatus.tsx` (exibir turno atual, mensagem de vitória/derrota/empate, botão de desistência)
- [X] T042 [US1] Implementar Server Action executeMove em `src/app/_actions/game-actions.ts` (validar entrada com ExecuteMoveSchema Zod, chamar ExecuteMoveUseCase, retornar GameStateDTO ou erro) - depende de T037
- [X] T043 [US1] Implementar Server Action startLocalGame em `src/app/_actions/game-actions.ts` (chamar StartLocalGameUseCase, retornar GameStateDTO inicial) - depende de T036
- [X] T044 [US1] Criar página de jogo local em `src/app/(auth)/game/local/page.tsx` (Server Component: orquestrar Board, GameStatus, MoveIndicator, integrar com Server Actions) - depende de T038-T043

### Testes e Validação

- [X] T045 [P] [US1] Teste unitário para GameEngine em `tests/unit/core/domain/GameEngine.test.ts` (testar execução de movimento simples, captura obrigatória, Lei da Maioria, promoção, win conditions)
- [X] T046 [P] [US1] Teste unitário para MoveValidator em `tests/unit/core/domain/MoveValidator.test.ts` (testar validação de diagonal, casas escuras, direções válidas para comum vs Dama)
- [X] T047 [P] [US1] Teste unitário para LeiDaMaioriaService em `tests/unit/core/domain/LeiDaMaioriaService.test.ts` (testar cálculo de caminhos de captura, seleção do caminho com mais peças)
- [X] T048 [P] [US1] Teste de integração para executeMove Server Action em `tests/integration/app/game-actions.test.ts` (testar validação Zod, chamada de use case, retorno de GameStateDTO)
- [X] T049 [US1] Validar User Story 1 conforme Acceptance Scenarios da spec.md (6 cenários: movimento inválido rejeitado, captura obrigatória aplicada, promoção a Dama, vitória por captura total, empate, Lei da Maioria)

**Estimativa Total Fase 3 (US1)**: ~24 horas

**Checkpoint de Revisão US1**: 
1. ✅ Verificar conformidade com Constituição (Clean Architecture, TypeScript strict, Repository Pattern)
2. ✅ Validar contra spec.md (FR-001 a FR-010, User Story 1 Acceptance Scenarios)
3. ✅ Executar testes unitários e integração (80% coverage mínimo em core/)
4. 🚨 **SOLICITAR FEEDBACK DO DESENVOLVEDOR**: User Story 1 está completa e conforme especificação?
5. ⏸️ **AGUARDAR APROVAÇÃO ANTES DE AVANÇAR PARA USER STORY 2**

---

## Fase 4: User Story 2 - Salvar e Carregar Partidas (Prioridade: P2)

**Objetivo**: Usuários autenticados podem salvar estado de partida em andamento e carregá-la posteriormente. Sistema persiste tabuleiro, turno, peças, histórico e valida limite de 50 partidas salvas.

**Teste Independente**: Iniciar partida → fazer jogadas → salvar → sair → retornar → carregar → verificar estado restaurado exatamente (posições, turno).

### Implementação Application Layer

- [ ] T050 [P] [US2] Criar DTOs em `src/core/application/dtos/`: SaveGameDTO.ts, LoadGameDTO.ts, SavedGameListDTO.ts
- [ ] T051 [US2] Implementar SaveGameUseCase em `src/core/application/use-cases/persistence/SaveGameUseCase.ts` (verificar autenticação Better-Auth, validar limite de 50 partidas em andamento por usuário conforme data-model.md, persistir estado via IGameRepository, logar ação)
- [ ] T052 [US2] Implementar LoadGameUseCase em `src/core/application/use-cases/persistence/LoadGameUseCase.ts` (verificar autenticação, carregar partida via IGameRepository, restaurar estado completo, logar ação)
- [ ] T053 [US2] Implementar DeleteGameHistoryUseCase em `src/core/application/use-cases/persistence/DeleteGameHistoryUseCase.ts` (verificar autorização - usuário só pode deletar próprias partidas, deletar via IGameRepository, logar ação)

### Implementação Presentation Layer

- [ ] T054 [US2] Implementar Server Action saveGame em `src/app/_actions/game-actions.ts` (validar entrada com SaveGameSchema Zod, chamar SaveGameUseCase, retornar sucesso ou erro MAX_SAVED_GAMES)
- [ ] T055 [US2] Implementar Server Action loadGame em `src/app/_actions/game-actions.ts` (validar LoadGameSchema, chamar LoadGameUseCase, retornar GameStateDTO ou erro)
- [ ] T056 [US2] Implementar Server Action deleteGameHistory em `src/app/_actions/game-actions.ts` (validar entrada, chamar DeleteGameHistoryUseCase, retornar sucesso ou erro UNAUTHORIZED)
- [ ] T057 [US2] Criar página de dashboard em `src/app/(auth)/dashboard/page.tsx` (Server Component: listar partidas salvas com data/modo/oponente, botões para carregar/deletar)
- [ ] T058 [US2] Adicionar botão "Salvar Partida" no GameStatus.tsx (chamar saveGame Server Action, exibir confirmação ou erro)
- [ ] T059 [US2] Adicionar rota de carregamento em página de jogo local (detectar gameId na URL, carregar estado via loadGame)

### Testes e Validação

- [ ] T060 [P] [US2] Teste unitário para SaveGameUseCase em `tests/unit/core/application/SaveGameUseCase.test.ts` (testar limite de 50 partidas, persistência de estado completo, logging)
- [ ] T061 [P] [US2] Teste de integração para saveGame Server Action em `tests/integration/app/game-actions.test.ts` (testar validação Zod, autenticação Better-Auth, erro MAX_SAVED_GAMES)
- [ ] T062 [US2] Validar User Story 2 conforme Acceptance Scenarios (4 cenários: salvar com confirmação, listar partidas, carregar com estado restaurado, erro ao carregar)

**Estimativa Total Fase 4 (US2)**: ~12 horas

**Checkpoint de Revisão US2**:
1. ✅ Verificar conformidade com Constituição (Repository Pattern, Better-Auth authorization, Zod validation)
2. ✅ Validar contra spec.md (FR-013 a FR-015, FR-019 a FR-020, User Story 2 Acceptance Scenarios)
3. ✅ Testar independentemente (salvar/carregar sem depender de US1 funcionar)
4. 🚨 **SOLICITAR FEEDBACK DO DESENVOLVEDOR**: User Story 2 está completa e conforme especificação?
5. ⏸️ **AGUARDAR APROVAÇÃO ANTES DE AVANÇAR PARA USER STORY 3**

---

## Fase 5: User Story 3 - Jogo contra Bot (IA) (Prioridade: P3)

**Objetivo**: Usuários podem jogar contra Bot com 3 níveis de dificuldade (Fácil: jogadas aleatórias válidas, Médio/Difícil: Minimax com alpha-beta pruning). Bot responde em <3 segundos.

**Teste Independente**: Iniciar partida vs Bot → selecionar dificuldade → verificar Bot executa jogadas válidas → testar captura obrigatória do Bot → testar tempo de resposta <3s.

### Implementação Infrastructure Layer (Bot)

- [ ] T063 [P] [US3] Implementar RandomBotService em `src/infrastructure/bot/RandomBotService.ts` (nível Fácil: selecionar jogada válida aleatória entre movimentos possíveis, respeitar captura obrigatória)
- [ ] T064 [US3] Implementar MinimaxBotService em `src/infrastructure/bot/MinimaxBotService.ts` (níveis Médio/Difícil: algoritmo Minimax com alpha-beta pruning, função de avaliação baseada em número de peças, Damas, posição no tabuleiro, timeout de 3 segundos)

### Implementação Application Layer

- [ ] T065 [P] [US3] Criar DTOs em `src/core/application/dtos/`: StartBotGameDTO.ts (com dificuldade selecionada)
- [ ] T066 [US3] Implementar StartBotGameUseCase em `src/core/application/use-cases/bot/StartBotGameUseCase.ts` (criar partida modo BOT, inicializar tabuleiro, selecionar BotService conforme dificuldade)
- [ ] T067 [US3] Implementar ExecuteBotMoveUseCase em `src/core/application/use-cases/bot/ExecuteBotMoveUseCase.ts` (chamar IBotService.calculateMove(), validar jogada do Bot via GameEngine, logar movimento, garantir resposta <3s)

### Implementação Presentation Layer

- [ ] T068 [US3] Implementar Server Action startBotGame em `src/app/_actions/game-actions.ts` (validar StartBotGameSchema com dificuldade, chamar StartBotGameUseCase, retornar GameStateDTO)
- [ ] T069 [US3] Criar página de jogo vs Bot em `src/app/(auth)/game/bot/page.tsx` (seleção de dificuldade, seleção de cor do jogador, iniciar partida, executar turnos alternados usuário/Bot)
- [ ] T070 [US3] Integrar ExecuteBotMoveUseCase com UI (após jogada do usuário, chamar Server Action para Bot jogar, atualizar tabuleiro)

### Testes e Validação

- [ ] T071 [P] [US3] Teste unitário para MinimaxBotService em `tests/unit/infrastructure/bot/MinimaxBotService.test.ts` (testar jogadas válidas, captura obrigatória respeitada, tempo de resposta <3s, estratégia avançada no nível Difícil)
- [ ] T072 [P] [US3] Teste unitário para ExecuteBotMoveUseCase em `tests/unit/core/application/ExecuteBotMoveUseCase.test.ts` (testar seleção de BotService, validação de jogada, logging)
- [ ] T073 [US3] Validar User Story 3 conforme Acceptance Scenarios (4 cenários: Bot executa jogada em <3s, Bot respeita captura obrigatória, Bot demonstra estratégia avançada no Difícil, vitória do Bot)

**Estimativa Total Fase 5 (US3)**: ~16 horas

**Checkpoint de Revisão US3**:
1. ✅ Verificar conformidade com Constituição (IBotService interface em ports/, implementações em infrastructure/)
2. ✅ Validar contra spec.md (FR-011, User Story 3 Acceptance Scenarios, Edge Cases - Bot não trava)
3. ✅ Testar performance (<3s response time para todos os níveis)
4. 🚨 **SOLICITAR FEEDBACK DO DESENVOLVEDOR**: User Story 3 está completa e conforme especificação?
5. ⏸️ **AGUARDAR APROVAÇÃO ANTES DE AVANÇAR PARA USER STORY 4**

---

## Fase 6: User Story 4 - Jogo Online entre Dois Jogadores (Prioridade: P4)

**Objetivo**: Usuários autenticados jogam online em tempo real via salas com código único de 6 caracteres. Sistema sincroniza estado em <1s, suporta espectadores ilimitados, reconexão automática (30s + 2min timeout), cleanup de salas inativas após 5min.

**Teste Independente**: Usuário 1 cria sala → compartilha código → Usuário 2 entra → jogam alternadamente → verificar sync <1s → Usuário 3 entra como espectador → testar desconexão/reconexão.

### Implementação Infrastructure Layer (WebSocket)

- [ ] T074 [US4] Configurar WebSocketServer em `src/infrastructure/websocket/WebSocketServer.ts` (Socket.io ou ws, autenticação JWT, gestão de rooms)
- [ ] T075 [P] [US4] Criar ConnectionHandler em `src/infrastructure/websocket/handlers/ConnectionHandler.ts` (gerenciar conexões/desconexões, autenticação Better-Auth JWT, logar eventos)
- [ ] T076 [P] [US4] Criar RoomHandler em `src/infrastructure/websocket/handlers/RoomHandler.ts` (gerenciar join/leave de salas, atualizar RoomMember.connectionStatus no Prisma)
- [ ] T077 [P] [US4] Implementar evento gameStateUpdate em `src/infrastructure/websocket/events/gameStateUpdate.ts` (broadcast estado do jogo para todos na sala, garantir latência <1s)
- [ ] T078 [P] [US4] Implementar evento playerDisconnected em `src/infrastructure/websocket/events/playerDisconnected.ts` (iniciar janela de reconexão de 30s, atualizar connectionStatus para DISCONNECTED)
- [ ] T079 [P] [US4] Implementar evento reconnectionStatus em `src/infrastructure/websocket/events/reconnectionStatus.ts` (gerenciar estados RECONNECTING, CONNECTED, timeout após 2min 30s total, sincronizar estado ao reconectar)

### Implementação Domain Layer

- [ ] T080 [P] [US4] Implementar RoomManager em `src/core/domain/services/RoomManager.ts` (gerar código único de 6 caracteres, validar código, cleanup de salas inativas >5min conforme FR-032)

### Implementação Application Layer

- [ ] T081 [P] [US4] Criar DTOs em `src/core/application/dtos/`: CreateRoomDTO.ts, JoinRoomDTO.ts, RoomStatusDTO.ts, LeaveRoomDTO.ts
- [ ] T082 [US4] Implementar CreateRoomUseCase em `src/core/application/use-cases/online/CreateRoomUseCase.ts` (verificar autenticação, gerar código via RoomManager, persistir sala no Prisma, logar ação)
- [ ] T083 [US4] Implementar JoinRoomUseCase em `src/core/application/use-cases/online/JoinRoomUseCase.ts` (verificar autenticação, validar código, adicionar jogador ou espectador conforme FR-023/024, atualizar RoomMember, logar ação)
- [ ] T084 [US4] Implementar ExecuteOnlineMoveUseCase em `src/core/application/use-cases/online/ExecuteOnlineMoveUseCase.ts` (validar jogada via GameEngine, persistir, emitir gameStateUpdate via IWebSocketService, logar movimento)
- [ ] T085 [US4] Implementar HandleReconnectionUseCase em `src/core/application/use-cases/online/HandleReconnectionUseCase.ts` (gerenciar janela de 30s, timeout de 2min, sincronizar estado ao reconectar, declarar derrota por abandono se timeout)

### Implementação Presentation Layer

- [ ] T086 [P] [US4] Criar componente RoomControls em `src/app/_components/game/RoomControls.tsx` (formulário para criar sala ou entrar via código, exibir código gerado para compartilhar)
- [ ] T087 [P] [US4] Criar componente SpectatorBadge em `src/app/_components/game/SpectatorBadge.tsx` (indicar modo espectador, exibir número de espectadores)
- [ ] T088 [US4] Implementar Server Action createRoom em `src/app/_actions/room-actions.ts` (validar CreateRoomSchema, chamar CreateRoomUseCase, retornar roomCode)
- [ ] T089 [US4] Implementar Server Action joinRoom em `src/app/_actions/room-actions.ts` (validar JoinRoomSchema com regex de código, chamar JoinRoomUseCase, retornar RoomStatusDTO ou erro ROOM_NOT_FOUND)
- [ ] T090 [US4] Implementar Server Action leaveRoom em `src/app/_actions/room-actions.ts` (chamar use case para remover jogador/espectador, emitir player_left via WebSocket, logar ação)
- [ ] T091 [US4] Criar página de jogo online em `src/app/(auth)/game/online/page.tsx` (integrar RoomControls, Board com sync WebSocket, GameStatus com indicador de conexão, SpectatorBadge)
- [ ] T092 [US4] Integrar WebSocket client-side (escutar gameStateUpdate, playerDisconnected, reconnectionStatus, atualizar UI em tempo real)

### Garbage Collection e Resiliência

- [ ] T093 [US4] Implementar cron job ou scheduled task para cleanup de salas inativas (usar sample query cleanupInactiveRooms de data-model.md, executar a cada 5min, logar cleanup)

### Testes e Validação

- [ ] T094 [P] [US4] Teste de integração para WebSocket em `tests/integration/infrastructure/WebSocketServer.test.ts` (testar conexão, autenticação JWT, eventos gameStateUpdate, playerDisconnected)
- [ ] T095 [P] [US4] Teste unitário para RoomManager em `tests/unit/core/domain/RoomManager.test.ts` (testar geração de código único, validação, cleanup de salas inativas)
- [ ] T096 [P] [US4] Teste de integração para createRoom/joinRoom em `tests/integration/app/room-actions.test.ts` (testar criação, entrada, modo espectador, erro ROOM_NOT_FOUND)
- [ ] T097 [US4] Validar User Story 4 conforme Acceptance Scenarios (6 cenários: criar sala com código, entrar via código, espectador, sync <1s, reconexão, desistência)

**Estimativa Total Fase 6 (US4)**: ~28 horas

**Checkpoint de Revisão US4**:
1. ✅ Verificar conformidade com Constituição (IWebSocketService interface, WebSocket em infrastructure/, use cases em application/)
2. ✅ Validar contra spec.md (FR-012, FR-021 a FR-032, User Story 4 Acceptance Scenarios, Clarifications sobre reconexão e cleanup)
3. ✅ Testar performance (<1s sync, reconexão 30s + 2min timeout)
4. ✅ Testar resiliência (desconexão, reconexão, timeout, cleanup de salas)
5. 🚨 **SOLICITAR FEEDBACK DO DESENVOLVEDOR**: User Story 4 está completa e conforme especificação?
6. ⏸️ **AGUARDAR APROVAÇÃO ANTES DE AVANÇAR PARA FASE FINAL**

---

## Fase 7: Polish & Cross-Cutting Concerns

**Propósito**: Melhorias que afetam múltiplas User Stories e preparação para produção

- [ ] T098 [P] Implementar getUserStats Server Action em `src/app/_actions/user-actions.ts` (chamar GetUserStatsUseCase, retornar estatísticas agregadas de GameStats)
- [ ] T099 [P] Criar página de perfil em `src/app/(auth)/profile/page.tsx` (exibir stats do usuário: vitórias, derrotas, empates, médias)
- [ ] T100 [P] Adicionar documentação JSDoc para todas as interfaces públicas em `core/application/ports/` e `core/domain/services/`
- [ ] T101 [P] Executar validação de coverage de testes: garantir >80% em `src/core/` (domain + application)
- [ ] T102 [P] Revisar e otimizar performance: verificar queries N+1 no Prisma, adicionar indexes conforme data-model.md
- [ ] T103 [P] Revisar segurança: confirmar todas as validações Zod, Better-Auth authorization checks, sem credentials hardcoded
- [ ] T104 [P] Criar landing page pública em `src/app/page.tsx` (apresentar jogo, botões para login/register)
- [ ] T105 [P] Configurar CI/CD pipeline básico (GitHub Actions): lint, type-check, unit tests, build
- [ ] T106 Executar validação completa via `quickstart.md`: testar setup local, todos os modos de jogo, todas as User Stories
- [ ] T107 Criar guia de deployment: instruções para Docker Compose, variáveis de ambiente de produção, Prisma migrations em prod
- [ ] T108 Refactoring final: remover código duplicado, aplicar Clean Code principles, garantir aderência a SOLID

**Estimativa Total Fase 7 (Polish)**: ~12 horas

**Checkpoint Final**:
1. ✅ Executar checklist completo de `checklists/release-gate.md` (100 itens de qualidade)
2. ✅ Validar todos os 10 Success Criteria da spec.md (SC-001 a SC-010)
3. ✅ Confirmar todos os 32 Functional Requirements implementados (FR-001 a FR-032)
4. ✅ Verificar conformidade total com Constitution v1.0.0
5. 🚨 **SOLICITAR APROVAÇÃO FINAL DO DESENVOLVEDOR**: Projeto pronto para produção?

---

## Dependências & Ordem de Execução

### Dependências de Fase

- **Setup (Fase 1)**: Sem dependências - pode começar imediatamente
- **Foundational (Fase 2)**: Depende de Setup completo - BLOQUEIA todas as User Stories
- **User Stories (Fases 3-6)**: Todas dependem de Foundational completa
  - User Stories podem prosseguir em paralelo (se houver equipe)
  - Ou sequencialmente por prioridade (P1 → P2 → P3 → P4)
- **Polish (Fase 7)**: Depende de todas as User Stories desejadas estarem completas

### Dependências de User Story

- **User Story 1 (P1 - MVP)**: Pode começar após Foundational - Sem dependências de outras stories
- **User Story 2 (P2)**: Pode começar após Foundational - Independente de US1 mas pode integrar com ela
- **User Story 3 (P3)**: Pode começar após Foundational - Independente de US1/US2 mas compartilha GameEngine
- **User Story 4 (P4)**: Pode começar após Foundational - Depende conceitualmente de US1 (regras do jogo) mas deve ser testável independentemente

### Dentro de Cada User Story

1. Domain Services/Entities (podem ser paralelos se marcados [P])
2. Use Cases (dependem de domain services)
3. Server Actions (dependem de use cases)
4. UI Components (podem ser paralelos com use cases se houver mocks)
5. Integração completa (depende de todos os anteriores)
6. Testes (marcados [P] podem executar em paralelo)
7. Validação de Acceptance Scenarios

### Oportunidades de Paralelização

**Fase 1 (Setup)**:
- T003, T004, T005, T007, T008 podem executar em paralelo após T001-T002

**Fase 2 (Foundational)**:
- Após T009-T011: T012, T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T023, T024, T025, T026, T027 todos em paralelo

**Fase 3 (US1)**:
- Domain: T029, T030, T031, T032, T033 em paralelo
- DTOs: T035 em paralelo com domain services
- UI: T038, T039, T040, T041 em paralelo
- Testes: T045, T046, T047, T048 em paralelo

**Fase 4 (US2)**:
- DTOs: T050 em paralelo
- Use Cases: T051, T052, T053 podem ter partes em paralelo
- Testes: T060, T061 em paralelo

**Fase 5 (US3)**:
- Bot Services: T063 e T064 em paralelo
- DTOs: T065 em paralelo
- Testes: T071, T072 em paralelo

**Fase 6 (US4)**:
- WebSocket: T075, T076, T077, T078, T079 em paralelo após T074
- DTOs: T081 em paralelo
- UI: T086, T087 em paralelo
- Testes: T094, T095, T096 em paralelo

**Fase 7 (Polish)**:
- T098, T099, T100, T101, T102, T103, T104, T105 podem executar em paralelo

### User Stories podem ser trabalhadas em paralelo por desenvolvedores diferentes

Com múltiplos desenvolvedores:
1. Equipe completa Setup + Foundational juntos (Fases 1-2)
2. Após Foundational concluída:
   - Dev A: User Story 1 (Fase 3)
   - Dev B: User Story 2 (Fase 4)
   - Dev C: User Story 3 (Fase 5)
   - Dev D: User Story 4 (Fase 6)
3. Stories completam e integram independentemente
4. Equipe junta para Polish (Fase 7)

---

## Exemplo de Paralelização: User Story 1

```bash
# Lançar todos os domain services juntos:
Task T029: MoveValidator.ts
Task T030: CaptureDetector.ts
Task T031: LeiDaMaioriaService.ts
Task T032: PromotionService.ts
Task T033: WinConditionChecker.ts

# Enquanto isso, lançar DTOs:
Task T035: ExecuteMoveDTO.ts, GameStateDTO.ts

# Após domain services prontos, lançar UI components:
Task T038: Board.tsx
Task T039: Piece.tsx
Task T040: MoveIndicator.tsx
Task T041: GameStatus.tsx

# Lançar testes em paralelo:
Task T045: GameEngine.test.ts
Task T046: MoveValidator.test.ts
Task T047: LeiDaMaioriaService.test.ts
Task T048: game-actions.test.ts
```

---

## Estratégia de Implementação

### MVP First (Apenas User Story 1)

1. Completar Fase 1: Setup (~4h)
2. Completar Fase 2: Foundational (~16h) **CRÍTICO - bloqueia todo o resto**
3. Completar Fase 3: User Story 1 (~24h)
4. **PARAR e VALIDAR**: Testar US1 independentemente
5. **SOLICITAR FEEDBACK DO DESENVOLVEDOR**
6. Deploy/demo se aprovado (MVP funcional!)

**Total MVP**: ~44 horas de desenvolvimento

### Entrega Incremental

1. Setup + Foundational → Fundação pronta (~20h)
2. + User Story 1 → Testar independentemente → Deploy/Demo (MVP - jogo local completo) (~24h)
3. + User Story 2 → Testar independentemente → Deploy/Demo (salvar/carregar adicionado) (~12h)
4. + User Story 3 → Testar independentemente → Deploy/Demo (Bot adicionado) (~16h)
5. + User Story 4 → Testar independentemente → Deploy/Demo (online adicionado) (~28h)
6. + Polish → Produção pronta (~12h)

**Total Completo**: ~112 horas de desenvolvimento

### Estratégia de Equipe Paralela

Com 4 desenvolvedores:
1. Todos: Setup + Foundational juntos (~20h)
2. Após Foundational (paralelo):
   - Dev A: US1 (~24h)
   - Dev B: US2 (~12h → pode ajudar em US1 ou US4)
   - Dev C: US3 (~16h → pode ajudar em US1 ou US4)
   - Dev D: US4 (~28h)
3. Tempo paralelo: ~28h (maior story)
4. Todos: Polish (~12h)

**Total com Paralelização**: ~60 horas de calendário (vs. 112h sequencial)

---

## Estimativas de Tempo

| Fase | User Story | Horas Estimadas | Prioridade |
|------|-----------|-----------------|------------|
| Fase 1 | Setup | 4h | - |
| Fase 2 | Foundational | 16h | **BLOQUEANTE** |
| Fase 3 | US1 - Jogo Local | 24h | P1 (MVP) 🎯 |
| Fase 4 | US2 - Salvar/Carregar | 12h | P2 |
| Fase 5 | US3 - Bot | 16h | P3 |
| Fase 6 | US4 - Online | 28h | P4 |
| Fase 7 | Polish | 12h | - |
| **TOTAL** | **Sequencial** | **112h** | - |

**MVP (apenas US1)**: 44 horas  
**Com Paralelização (4 devs)**: 60 horas de calendário

---

## Notas

- **[P]** = Tarefas podem executar em paralelo (arquivos diferentes, sem dependências)
- **[Story]** = Label mapeia tarefa para User Story específica (rastreabilidade)
- **Cada User Story deve ser completável e testável independentemente**
- **Revisões Obrigatórias**: Após cada User Story, verificar Constituição + Especificação + Solicitar Feedback
- **Commit após cada tarefa ou grupo lógico**
- **Parar em cada checkpoint para validar story independentemente**
- **Evitar**: tarefas vagas, conflitos no mesmo arquivo, dependências cross-story que quebram independência

---

## Revisão de Qualidade Final

Antes de considerar o projeto completo, executar:

1. **Checklist de Release Gate** (`checklists/release-gate.md`): Validar todos os 100 itens
2. **Success Criteria** (spec.md): Confirmar SC-001 a SC-010
3. **Functional Requirements**: Confirmar FR-001 a FR-032 implementados
4. **Constitution Compliance**: Verificar conformidade total com v1.0.0
5. **Test Coverage**: Confirmar >80% em `src/core/`
6. **Performance**: Validar <1s sync online, <3s bot response
7. **Security**: Confirmar Zod validation, Better-Auth authorization, sem credentials hardcoded
8. **Quickstart Validation**: Executar guia completo de setup local
9. **Edge Cases**: Testar todos os cenários de edge cases da spec.md
10. **Logging**: Verificar auditoria completa (FR-025, FR-026) para todos os eventos

**🚨 Aprovação Final Obrigatória**: Após todos os checkpoints de User Stories e validação final, solicitar aprovação do desenvolvedor antes de deploy em produção.
