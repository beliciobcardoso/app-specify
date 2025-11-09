# Checklist de Qualidade: Jogo de Damas - Release Gate

**Propósito**: Validação rigorosa de qualidade dos requisitos antes do release - checagem formal de completude, clareza, consistência e traceability dos requisitos do Jogo de Damas.

**Criado**: 2025-11-08  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)  
**Nível**: Release Gate (Rigoroso)  
**Escopo**: Abrangente (Regras do jogo + Arquitetura + Casos de Uso + Requisitos Não-Funcionais + Resiliência)

---

## 1. Completude de Requisitos - Regras do Jogo

- [x] CHK001 - São especificados os critérios exatos de configuração inicial do tabuleiro (8x8, 64 casas, cores alternadas, posicionamento das 12 peças de cada jogador nas casas escuras das três primeiras fileiras)? [Completude, Spec §Descrição Inicial]

- [x] CHK002 - As regras de movimento de peça comum (pedra) estão quantificadas com restrições mensuráveis (apenas uma casa diagonal para frente, apenas casas escuras)? [Clareza, Spec §Descrição Inicial]

- [x] CHK003 - Os critérios de movimento de Dama estão completos com alcance exato (múltiplas casas vazias na diagonal, frente e trás, similar ao Bispo)? [Completude, Spec §Descrição Inicial]

- [x] CHK004 - A regra de captura obrigatória está definida com comportamento mensurável (bloqueio de movimentos que não sejam capturas quando captura está disponível)? [Clareza, Spec §FR-003]

- [x] CHK005 - A "Lei da Maioria" está especificada com critérios objetivos (quando múltiplos caminhos de captura existem, exigir o caminho que captura o maior número de peças)? [Completude, Spec §FR-005]

- [x] CHK006 - As regras de captura bidirecional (para frente e para trás) estão explicitamente documentadas para peças comuns? [Clareza, Spec §Descrição Inicial - regra brasileira]

- [x] CHK007 - Os critérios de promoção a Dama estão completos (alcançar oitava fileira/base do oponente)? [Completude, Spec §FR-007]

- [x] CHK008 - O comportamento de captura com Dama está especificado com regra de pouso mensurável (aterrissar obrigatoriamente na casa vazia imediatamente após a peça capturada)? [Clareza, Spec §Descrição Inicial]

- [x] CHK009 - As condições de vitória estão definidas com critérios mensuráveis (jogador com maior número de peças, ou captura de todas as peças do oponente)? [Completude, Spec §FR-009, Edge Cases]

- [x] CHK010 - As condições de derrota estão especificadas (menor número de peças ou nenhuma peça)? [Completude, Spec §Descrição Inicial]

- [x] CHK011 - As condições de empate estão completas (ambos os jogadores sem movimentos legais E número de peças igual)? [Completude, Spec §FR-009]

- [x] CHK012 - O comportamento de desistência está documentado (jogador pode desistir a qualquer momento, registrado como derrota)? [Completude, Spec §Descrição Inicial]

---

## 2. Completude de Requisitos - Modos de Jogo

- [x] CHK013 - São definidos requisitos completos para o modo de jogo local (dois jogadores no mesmo dispositivo, alternância de turnos)? [Completude, Spec §User Story 1]

- [x] CHK014 - São especificados requisitos completos para o modo online (conexão via salas, código único de 6 caracteres, sincronização em tempo real)? [Completude, Spec §User Story 4, FR-012]

- [x] CHK015 - São documentados requisitos completos para o modo Bot (3 níveis de dificuldade: Fácil, Médio, Difícil)? [Completude, Spec §User Story 3, FR-011]

- [x] CHK016 - Os requisitos de salvar/carregar partidas estão completos (persistência de estado completo: tabuleiro, turno, peças, histórico)? [Completude, Spec §User Story 2, FR-014, FR-015]

- [x] CHK017 - O sistema de salas online está especificado com regras claras (criação de sala gera código único, outro jogador insere código para entrar)? [Clareza, Spec §FR-021, Clarifications]

- [x] CHK018 - O modo espectador está documentado com requisitos completos (entrada quando sala tem 2 jogadores ativos, visualização em tempo real sem interferência)? [Completude, Spec §FR-023, FR-024]

---

## 3. Clareza e Mensurabilidade de Requisitos

- [x] CHK019 - O termo "feedback visual claro" está quantificado com critérios mensuráveis (destacar peças com capturas disponíveis, indicar movimentos válidos/inválidos)? [Clareza, Spec §Descrição Inicial, FR-016]

- [x] CHK020 - O requisito de "tempo de resposta razoável" do Bot está especificado com threshold mensurável (<3 segundos)? [Clareza, Spec §User Story 3, Plan §Performance Goals]

- [x] CHK021 - O requisito de "sincronização em tempo real" está quantificado com latência máxima (<1 segundo)? [Clareza, Spec §User Story 4, Plan §Performance Goals]

- [x] CHK022 - O termo "UI amigável e responsiva" está definido com critérios mensuráveis (breakpoints mobile/desktop, acessibilidade)? [Ambiguidade, Spec §Descrição Inicial]

- [x] CHK023 - O conceito de "auditoria completa" no logging está especificado com lista exata de eventos a serem registrados? [Clareza, Spec §Clarifications - Logging]

- [x] CHK024 - O requisito de "estratégia avançada" do Bot (nível Difícil) está definido com comportamento mensurável (planejamento de múltiplas capturas, proteção de peças)? [Clareza, Spec §User Story 3 - Acceptance Scenario 3]

---

## 4. Consistência de Requisitos

- [x] CHK025 - Os requisitos de captura obrigatória são consistentes entre peças comuns e Damas (ambas devem respeitar a regra)? [Consistência, Spec §FR-003, FR-006]

- [x] CHK026 - A Lei da Maioria é aplicada de forma consistente a peças comuns e Damas (ambas seguem a mesma regra de seleção de caminho)? [Consistência, Spec §FR-005, FR-008]

- [x] CHK027 - As condições de vitória/derrota são consistentes entre os três modos de jogo (local, online, bot)? [Consistência, Spec §User Stories 1-4]

- [x] CHK028 - Os requisitos de autenticação são consistentes entre salvar/carregar partidas e criar/entrar em salas online? [Consistência, Spec §FR-013, FR-020, FR-022]

- [x] CHK029 - Os requisitos de validação server-side são aplicados de forma consistente em todos os Server Actions? [Consistência, Plan §Constitution Check - Security, Contracts/server-actions.md]

---

## 5. Cobertura de Cenários - Fluxos Principais

- [x] CHK030 - São definidos requisitos para o fluxo completo de uma partida local (início → jogadas → captura → promoção → vitória/empate)? [Cobertura, Spec §User Story 1]

- [x] CHK031 - São especificados requisitos para o fluxo de criação e entrada em sala online (criar sala → gerar código → outro jogador entra → jogo inicia)? [Cobertura, Spec §User Story 4]

- [x] CHK032 - São documentados requisitos para o fluxo de espectador (sala com 2 jogadores → terceiro usuário entra → visualiza em tempo real)? [Cobertura, Spec §FR-023, FR-024]

- [x] CHK033 - São definidos requisitos para o fluxo de salvar/carregar partida (partida em andamento → salvar → sair → retornar → carregar → estado restaurado)? [Cobertura, Spec §User Story 2]

- [x] CHK034 - São especificados requisitos para o fluxo de jogo contra Bot (selecionar dificuldade → iniciar → turnos alternados → Bot responde em <3s)? [Cobertura, Spec §User Story 3]

---

## 6. Cobertura de Cenários - Fluxos Alternativos

- [x] CHK035 - São definidos requisitos para o cenário de múltiplos caminhos de captura com mesmo número de peças (jogador pode escolher qualquer caminho)? [Cobertura, Spec §Edge Cases - Lei da Maioria]

- [x] CHK036 - São especificados requisitos para o cenário de movimento inválido rejeitado (tentativa de mover para casa clara ou direção inválida)? [Cobertura, Spec §User Story 1 - Acceptance Scenario 1]

- [x] CHK037 - São documentados requisitos para o cenário de impedimento de movimento quando captura obrigatória existe? [Cobertura, Spec §User Story 1 - Acceptance Scenario 2, Edge Cases]

- [x] CHK038 - São definidos requisitos para o cenário de escolha de nível de dificuldade do Bot? [Cobertura, Spec §User Story 3]

- [x] CHK039 - São especificados requisitos para o cenário de entrada em sala online como espectador quando sala já tem 2 jogadores? [Cobertura, Spec §FR-023, FR-024]

---

## 7. Cobertura de Cenários - Exceções e Erros

- [x] CHK040 - São definidos requisitos para o tratamento de tentativa de movimento fora do turno do jogador? [Cobertura - Exception, Spec §Edge Cases, Contracts/server-actions.md - INVALID_MOVE]

- [x] CHK041 - São especificados requisitos para o tratamento de tentativa de salvar partida sem autenticação? [Cobertura - Exception, Spec §Edge Cases - Autenticação]

- [x] CHK042 - São documentados requisitos para o tratamento de erro ao carregar partida salva (recuperação de dados falha)? [Cobertura - Exception, Spec §User Story 2 - Acceptance Scenario 4]

- [x] CHK043 - São definidos requisitos para o tratamento de tentativa de captura inválida com Dama (não aterra na primeira casa vazia)? [Cobertura - Exception, Spec §Edge Cases - Dama]

- [x] CHK044 - São especificados requisitos para o tratamento de código de sala inválido ou inexistente? [Gap - Exception, Online Mode]

- [x] CHK045 - São documentados requisitos para o tratamento de erro de conexão WebSocket durante criação de sala? [Gap - Exception, Online Mode]

- [x] CHK046 - São definidos requisitos para o tratamento de exceção do Bot em estado de jogo perdedor inevitável (Bot não deve travar)? [Cobertura - Exception, Spec §Edge Cases - Bot]

---

## 8. Cobertura de Cenários - Recuperação e Resiliência

- [x] CHK047 - São definidos requisitos completos para o fluxo de desconexão temporária (perda de conexão → aguardar 30s → reconexão automática → sincronização de estado)? [Cobertura - Recovery, Spec §FR-027, Clarifications]

- [x] CHK048 - São especificados requisitos completos para o timeout de inatividade após desconexão (30s sem reconexão → iniciar contagem de 2min → sem retorno → derrota por abandono)? [Cobertura - Recovery, Spec §FR-028, Clarifications]

- [x] CHK049 - São documentados requisitos para o fluxo de reconexão bem-sucedida durante janela de 30s (estado do jogo sincronizado, partida continua normalmente)? [Cobertura - Recovery, Spec §User Story 4 - Acceptance Scenario 5]

- [x] CHK050 - São definidos requisitos para o comportamento quando jogador desiste formalmente da partida (notificação de oponente/espectadores, vitória atribuída ao oponente)? [Cobertura - Recovery, Spec §User Story 4 - Acceptance Scenario 6]

- [x] CHK051 - São especificados requisitos para o rollback/cleanup quando partida online é abortada por abandono (atualização de stats, liberação de recursos)? [Gap - Recovery, Online Mode]

- [x] CHK052 - São documentados requisitos para o comportamento de reconexão do espectador (desconexão → reconexão → sincronização de estado atual do jogo)? [Gap - Recovery, Spectator Mode]

---

## 9. Requisitos Não-Funcionais - Performance

- [x] CHK053 - O requisito de sincronização de estado de jogo (<1s) está especificado com percentil de latência (95% dos casos com latency <200ms)? [Clareza - NFR, Plan §Performance Goals]

- [x] CHK054 - O requisito de tempo de resposta do Bot (<3s) está documentado para todos os níveis de dificuldade? [Completude - NFR, Spec §User Story 3, Plan §Performance Goals]

- [x] CHK055 - São definidos requisitos de performance para cleanup de salas inativas (automático após 5 minutos)? [Completude - NFR, Spec §FR-032, Clarifications]

- [x] CHK056 - São especificados requisitos de latência aceitável para sincronização WebSocket em diferentes condições de rede? [Gap - NFR, Online Mode]

- [x] CHK057 - São documentados requisitos de tempo de carregamento de partidas salvas (target de performance)? [Gap - NFR, Save/Load Mode]

---

## 10. Requisitos Não-Funcionais - Segurança

- [x] CHK058 - São definidos requisitos de validação server-side para todos os movimentos (bloqueio de validação apenas client-side)? [Completude - NFR, Plan §Constitution Check - Security, Contracts/server-actions.md]

- [x] CHK059 - São especificados requisitos de autenticação para operações protegidas (salvar/carregar, criar/entrar em salas)? [Completude - NFR, Spec §FR-013, FR-020, FR-022]

- [x] CHK060 - São documentados requisitos de autorização para impedir manipulação de partidas de outros usuários? [Gap - NFR, Security]

- [x] CHK061 - São definidos requisitos de proteção contra credenciais hardcoded (uso exclusivo de `.env`)? [Completude - NFR, Plan §Constitution Check - Security]

- [x] CHK062 - São especificados requisitos de validação Zod para todos os Server Actions e Route Handlers? [Completude - NFR, Plan §Technical Context, Contracts/server-actions.md]

- [x] CHK063 - São documentados requisitos de JWT/token authentication para conexões WebSocket? [Gap - NFR, Contracts/websocket-events.md - Implementation Notes]

---

## 11. Requisitos Não-Funcionais - Escalabilidade

- [x] CHK064 - São definidos requisitos de limite de partidas salvas em andamento por usuário (50 partidas)? [Completude - NFR, Plan §Scale/Scope, Data-model.md - Sample Queries]

- [x] CHK065 - São especificados requisitos de suporte a salas online ilimitadas (com garbage collection automático)? [Completude - NFR, Plan §Scale/Scope, Spec §FR-032]

- [x] CHK066 - São documentados requisitos de suporte a espectadores ilimitados por sala (máximo de 2 jogadores ativos)? [Completude - NFR, Plan §Scale/Scope, Spec §FR-023]

- [x] CHK067 - São definidos requisitos de retenção de dados de partidas finalizadas (indefinida até usuário deletar)? [Completude - NFR, Spec §FR-029, Clarifications]

- [x] CHK068 - São especificados requisitos de estratégia de scaling para WebSocket (ex: Redis adapter para multi-servidor)? [Gap - NFR, Contracts/websocket-events.md - Implementation Notes]

---

## 12. Requisitos Não-Funcionais - Acessibilidade e UX

- [x] CHK069 - São definidos requisitos de acessibilidade para navegação por teclado (interação com tabuleiro e peças)? [Gap - NFR, UI/UX]

- [x] CHK070 - São especificados requisitos de contraste de cores para usuários com deficiência visual (WCAG compliance)? [Gap - NFR, Accessibility]

- [x] CHK071 - São documentados requisitos de responsividade para diferentes tamanhos de tela (mobile, tablet, desktop)? [Ambiguidade, Spec §Descrição Inicial - "UI responsiva"]

- [x] CHK072 - São definidos requisitos de feedback visual para todas as interações críticas (movimento válido/inválido, captura obrigatória, vitória/derrota)? [Completude - NFR, Spec §FR-016]

- [x] CHK073 - São especificados requisitos de indicadores de loading/aguardando para operações assíncronas (salvamento, carregamento, resposta do Bot)? [Gap - NFR, UX]

---

## 13. Dependências e Integrações

- [x] CHK074 - São documentadas as dependências de infraestrutura (PostgreSQL via Docker, strings de conexão em `.env`)? [Completude - Dependency, Plan §Technical Context]

- [x] CHK075 - São especificados os requisitos de integração com Better-Auth (Prisma adapter, modelos User/Account/Session)? [Completude - Dependency, Plan §Technical Context, Data-model.md]

- [x] CHK076 - São definidos os requisitos de integração com Prisma ORM (Repository Pattern, interfaces em `core/application/ports/`)? [Completude - Dependency, Plan §Constitution Check]

- [x] CHK077 - São documentados os requisitos de integração WebSocket (Socket.io ou ws, eventos definidos em contracts/websocket-events.md)? [Completude - Dependency, Contracts/websocket-events.md]

- [x] CHK078 - São especificados os requisitos de validação Zod (schemas para todos os Server Actions)? [Completude - Dependency, Contracts/server-actions.md]

- [x] CHK079 - São definidos os requisitos de dependência entre modos de jogo (User Story 4 depende de User Story 1 e 2)? [Traceability, Spec §User Story 4 - Why this priority]

---

## 14. Ambiguidades e Conflitos

- [x] CHK080 - O termo "jogador tiver o maior número de peças" nas condições de vitória é consistente com "capturar todas as peças do oponente" (ambos são critérios válidos ou há prioridade)? [Ambiguidade, Spec §Descrição Inicial vs Edge Cases]

- [x] CHK081 - A regra de "Dama aterrissa obrigatoriamente na casa vazia imediatamente após a peça capturada" está clarificada para capturas múltiplas em sequência (aterra após cada captura ou apenas após a última)? [Ambiguidade, Spec §Descrição Inicial]

- [x] CHK082 - O comportamento de "partidas salvas" está clarificado (limite de 50 aplica-se apenas a partidas em andamento ou também a partidas finalizadas)? [Ambiguidade, Plan §Scale/Scope vs Spec §FR-029]

- [x] CHK083 - O termo "movimento de longo alcance" da Dama está clarificado (pode capturar a qualquer distância ou apenas uma peça por vez mesmo com múltiplas casas de distância)? [Ambiguidade, Spec §Descrição Inicial]

---

## 15. Traceability e Documentação

- [x] CHK084 - Todos os 32 requisitos funcionais (FR-001 a FR-032) estão mapeados para componentes técnicos específicos no plan.md? [Traceability, Plan §Project Structure]

- [x] CHK085 - Todas as User Stories (1-4) possuem critérios de aceitação mensuráveis e testáveis? [Traceability, Spec §User Scenarios]

- [x] CHK086 - Todos os Server Actions (11 actions) estão mapeados para Use Cases específicos em `core/application/use-cases/`? [Traceability, Contracts/server-actions.md]

- [x] CHK087 - Todos os eventos WebSocket (18 events) referenciam requisitos funcionais específicos (FR-XXX)? [Traceability, Contracts/websocket-events.md]

- [x] CHK088 - Todos os modelos Prisma (9 models) estão mapeados para requisitos funcionais que justificam sua existência? [Traceability, Data-model.md]

- [x] CHK089 - É estabelecido um sistema de ID de requisitos e critérios de aceitação para facilitar rastreamento futuro? [Traceability, Gap]

---

## 16. Qualidade de Critérios de Aceitação

- [x] CHK090 - Os critérios de aceitação da User Story 1 (Jogo Local) são mensuráveis e testáveis (ex: "movimento é rejeitado" pode ser verificado objetivamente)? [Acceptance Criteria Quality, Spec §User Story 1]

- [x] CHK091 - Os critérios de aceitação da User Story 2 (Salvar/Carregar) incluem verificação de estado completo (tabuleiro, peças, turno, histórico)? [Acceptance Criteria Quality, Spec §User Story 2]

- [x] CHK092 - Os critérios de aceitação da User Story 3 (Bot) especificam comportamento mensurável para diferentes níveis de dificuldade? [Acceptance Criteria Quality, Spec §User Story 3]

- [x] CHK093 - Os critérios de aceitação da User Story 4 (Online) incluem verificação de sincronização em tempo real com threshold de latência? [Acceptance Criteria Quality, Spec §User Story 4]

- [x] CHK094 - Todos os critérios de aceitação das Edge Cases são testáveis de forma objetiva? [Acceptance Criteria Quality, Spec §Edge Cases]

---

## 17. Cobertura de Testes e Validação

- [x] CHK095 - São definidos requisitos de cobertura mínima de testes (80% para lógica de negócio em `core/`)? [Completude - Testing, Plan §Constitution Check]

- [x] CHK096 - São especificados requisitos de testes unitários para serviços de domínio (GameEngine, MoveValidator, LeiDaMaioriaService)? [Completude - Testing, Plan §Testing]

- [x] CHK097 - São documentados requisitos de testes de integração para Server Actions (validação Zod, chamada de use cases, atualização de estado)? [Completude - Testing, Plan §Testing]

- [x] CHK098 - São definidos requisitos de testes end-to-end para fluxos completos de cada User Story? [Gap - Testing]

- [x] CHK099 - São especificados requisitos de testes de performance (verificação de <1s sync, <3s bot response)? [Gap - Testing, Performance]

- [x] CHK100 - São documentados requisitos de testes de resiliência (simulação de desconexão, reconexão, timeout)? [Gap - Testing, Resilience]

---

## Notas

- Marque os itens conforme concluídos: `[x]`
- Adicione comentários inline para achados ou necessidade de refinamento
- Link para recursos ou documentação relevante quando aplicável
- Itens numerados sequencialmente (CHK001-CHK100) para referência fácil
- **Traceability mínima**: ≥80% dos itens incluem referência a spec/plan/contracts
- **Próximos passos após checklist**: Revisar itens marcados como `[Gap]` ou `[Ambiguity]` e atualizar spec.md/plan.md conforme necessário antes de avançar para /speckit.tasks

