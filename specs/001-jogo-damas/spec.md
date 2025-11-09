# Feature Specification: Jogo de Damas Completo

**Feature Branch**: `001-jogo-damas`  
**Created**: 2025-11-08  
**Status**: Draft  
**Input**: User description: "Esta é a especificação para a criação de um jogo de Damas completo. O sistema deve implementar um tabuleiro de 64 casas (8x8) com cores alternadas, para dois jogadores (12 peças claras vs. 12 escuras) posicionados nas casas escuras das três primeiras fileiras de cada lado. O objetivo principal é a captura ou bloqueio total das peças do oponente. A peça comum (pedra) move-se apenas uma casa para frente na diagonal, sempre em casas escuras. A captura é o elemento central e obrigatório: o jogador deve saltar sobre uma peça adversária (para uma casa vazia) se a oportunidade existir, podendo capturar tanto para frente quanto para trás (regra brasileira). Se múltiplas capturas forem possíveis na mesma jogada, elas devem ser continuadas; se houver diferentes caminhos de captura, a 'Lei da Maioria' (capturar o maior número de peças) é obrigatória. A promoção para 'Dama' ocorre quando uma pedra alcança a oitava fileira (base do oponente); a Dama ganha movimento de longo alcance (similar ao Bispo, por múltiplas casas vazias na diagonal, para frente e para trás) e captura à distância, aterrissando obrigatoriamente na casa vazia imediatamente após a peça capturada, também seguindo a Lei da Maioria. As condições de término são: a Vitória é declarada para o jogador que tiver o maior número de peças; a Derrota é declarada para o jogador com o menor número de peças ou nenhuma peça. Se ambos os jogadores ficarem sem movimentos legais (sufocados) e o número de peças for igual, o jogo deve ser declarado como Empate. Adicionalmente, um jogador pode Desistir da partida a qualquer momento, o que será registrado como uma derrota para ele. O sistema deve incluir três modos de jogo: 1) Jogo local/prática, 2) Jogo para dois jogadores em rede (online), e 3) Jogo contra um Bot (IA) com diferentes níveis de dificuldade. Funcionalidades adicionais necessárias incluem a capacidade de salvar e carregar partidas em andamento. A interface do usuário (UI) deve ser amigável, responsiva e fornecer feedback visual claro para movimentos válidos e inválidos. Toda a lógica de regras e funcionalidades do jogo deve ser claramente documentada."

## Clarifications

### Session 2025-11-08

- Q: Como dois jogadores se conectam para uma partida online? → A: Sistema de salas com código/convite - Jogador cria sala e compartilha código único; outro jogador insere código para entrar. Quando há dois jogadores ativos, outras pessoas podem entrar como espectadores para assistir a partida.
- Q: Quais eventos do sistema devem ser registrados em logs para suporte e depuração? → A: Auditoria completa - Registrar ações de usuário (login, criação de sala, salvamento), eventos de jogo (movimentos, capturas, vitórias/derrotas), erros de validação, tentativas de movimento inválido, reconexões, timeouts e exceções do sistema.
- Q: O que acontece se um jogador abandona partida online sem desistir formalmente? → A: Janela de reconexão com timeout progressivo - Sistema aguarda 30 segundos para reconexão automática; se reconectar, partida continua normalmente. Caso contrário, inicia contagem de 2 minutos de inatividade; se jogador não retornar após esse período, sistema declara derrota por abandono e vitória do oponente.
- Q: Por quanto tempo devem ser mantidos dados de partidas finalizadas? → A: Indefinidamente até usuário deletar - Todas as partidas finalizadas (locais, online, contra bot) são mantidas permanentemente no perfil do usuário até que ele decida excluí-las manualmente. Usuário tem controle total sobre seus dados históricos.
- Q: Deve haver limite de taxa para criação de salas online? → A: Sem limites de criação - Usuários podem criar quantas salas quiserem sem restrição. Para evitar sobrecarga, sistema automaticamente destrói salas inativas (sem nenhum jogador conectado) após 5 minutos de inatividade.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogo Local para Dois Jogadores (Priority: P1)

Dois jogadores podem jogar Damas localmente no mesmo dispositivo, alternando turnos. O sistema exibe um tabuleiro 8x8 com peças posicionadas corretamente, permite movimentos válidos (apenas casas escuras, diagonais), aplica a regra de captura obrigatória e a Lei da Maioria, promove peças a Damas quando alcançam a base adversária, e detecta condições de vitória, derrota ou empate.

**Why this priority**: É o núcleo do jogo (MVP). Toda a lógica de regras fundamental está aqui. Sem isso, não há jogo de Damas.

**Independent Test**: Pode ser totalmente testado iniciando uma partida local, executando uma sequência completa de jogadas (movimentos simples, capturas obrigatórias, promoção a Dama, capturas com Dama) e verificando se o vencedor é declarado corretamente ao final.

**Acceptance Scenarios**:

1. **Given** o jogo está iniciado com o tabuleiro configurado corretamente, **When** um jogador tenta mover uma peça para uma casa clara ou em direção não-diagonal, **Then** o movimento é rejeitado com feedback visual claro
2. **Given** uma peça do jogador pode capturar uma peça adversária, **When** o jogador tenta fazer um movimento que não seja essa captura, **Then** o sistema impede o movimento e exige a captura obrigatória
3. **Given** uma peça comum alcança a oitava fileira (base do oponente), **When** o movimento é concluído, **Then** a peça é promovida a Dama com capacidade de movimento de longo alcance
4. **Given** um jogador captura todas as peças do oponente, **When** a última peça é capturada, **Then** o sistema declara vitória para o jogador ativo e exibe a tela de resultado
5. **Given** ambos os jogadores ficam sem movimentos legais e têm o mesmo número de peças, **When** o sistema detecta essa condição, **Then** um empate é declarado
6. **Given** há múltiplos caminhos de captura disponíveis, **When** o jogador deve escolher, **Then** o sistema aplica a Lei da Maioria e exige o caminho que captura mais peças

---

### User Story 2 - Salvar e Carregar Partidas (Priority: P2)

Usuários autenticados podem salvar o estado atual de uma partida em andamento a qualquer momento e carregá-la posteriormente para continuar jogando de onde pararam. O sistema persiste o estado completo do tabuleiro, turno atual, número de peças de cada jogador e histórico de jogadas.

**Why this priority**: Essencial para engajamento de longo prazo. Permite que jogadores retomem partidas sem perder progresso, especialmente importante para partidas online ou contra Bot que podem ser interrompidas.

**Independent Test**: Iniciar uma partida, executar várias jogadas, salvar a partida, sair do jogo, retornar e carregar a partida salva, verificando que o estado é restaurado exatamente como estava (posições das peças, turno correto).

**Acceptance Scenarios**:

1. **Given** um usuário autenticado está em uma partida em andamento, **When** o usuário seleciona a opção "Salvar Partida", **Then** o estado completo do jogo é persistido e uma confirmação é exibida
2. **Given** um usuário autenticado possui partidas salvas, **When** o usuário acessa o menu "Carregar Partida", **Then** uma lista de partidas salvas é exibida com informações relevantes (data, modo de jogo, oponente)
3. **Given** uma partida foi salva com sucesso, **When** o usuário carrega essa partida, **Then** o tabuleiro, as peças e o turno atual são restaurados exatamente como estavam no momento do salvamento
4. **Given** o usuário tenta carregar uma partida, **When** há um erro ao recuperar os dados, **Then** uma mensagem de erro clara é exibida e o usuário pode tentar novamente

---

### User Story 3 - Jogo contra Bot (IA) (Priority: P3)

Usuários podem jogar contra um oponente controlado por inteligência artificial (Bot) com diferentes níveis de dificuldade (Fácil, Médio, Difícil). O Bot toma decisões válidas seguindo as regras do jogo, com tempo de resposta razoável.

**Why this priority**: Permite prática individual e aumenta a acessibilidade do jogo para usuários que não têm um oponente humano disponível. Menos crítico que o jogo local básico, mas importante para experiência completa.

**Independent Test**: Iniciar uma partida contra o Bot, executar turnos alternados (usuário vs. Bot), verificar que o Bot faz jogadas válidas de acordo com as regras, testa diferentes níveis de dificuldade e confirma que o Bot respeita captura obrigatória e Lei da Maioria.

**Acceptance Scenarios**:

1. **Given** o usuário inicia uma partida contra o Bot selecionando um nível de dificuldade, **When** é o turno do Bot, **Then** o Bot executa uma jogada válida dentro de 3 segundos
2. **Given** o Bot tem uma captura obrigatória disponível, **When** é o turno do Bot, **Then** o Bot executa a captura conforme a regra obrigatória
3. **Given** o usuário selecionou o nível "Difícil", **When** o Bot joga, **Then** o Bot demonstra estratégia avançada (ex: planejamento de múltiplas capturas, proteção de peças)
4. **Given** o Bot captura todas as peças do usuário, **When** a última peça é capturada, **Then** o sistema declara vitória para o Bot

---

### User Story 4 - Jogo Online entre Dois Jogadores (Priority: P4)

Dois usuários autenticados podem jogar entre si em tempo real pela internet usando um sistema de salas com código único. Um jogador cria uma sala e compartilha o código; o outro insere o código para entrar. O sistema sincroniza o estado do tabuleiro entre os jogadores, notifica cada jogador quando é sua vez, e mantém a partida estável mesmo com latência de rede moderada. Quando a sala possui dois jogadores ativos, outras pessoas podem entrar como espectadores para assistir a partida em tempo real.

**Why this priority**: Expande significativamente o alcance do jogo permitindo partidas remotas, mas requer infraestrutura adicional (WebSocket/realtime, gestão de salas) e é dependente das User Stories 1 e 2.

**Independent Test**: Dois usuários em dispositivos diferentes iniciam uma partida online (um cria sala, outro entra com código), executam jogadas alternadas, verificam que as jogadas são sincronizadas em tempo real, testam reconexão em caso de perda temporária de conexão, e um terceiro usuário entra como espectador para assistir.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado deseja criar uma partida online, **When** o usuário seleciona "Criar Sala", **Then** o sistema gera um código único de 6 caracteres e exibe para o usuário compartilhar
2. **Given** outro usuário autenticado possui um código de sala, **When** o usuário insere o código e confirma, **Then** ambos são conectados e o jogo inicia com o tabuleiro sincronizado
3. **Given** uma sala possui dois jogadores ativos, **When** um terceiro usuário entra com o mesmo código, **Then** o usuário entra no modo espectador e pode assistir a partida em tempo real sem interferir
4. **Given** um jogador executa uma jogada válida, **When** a jogada é confirmada, **Then** o tabuleiro do oponente e dos espectadores é atualizado em tempo real (em até 1 segundo)
5. **Given** um jogador perde conexão temporariamente durante a partida, **When** a conexão é restaurada, **Then** o estado do jogo é sincronizado e o jogador pode continuar
6. **Given** um jogador desiste da partida, **When** o comando de desistência é confirmado, **Then** o oponente e espectadores são notificados e a vitória é atribuída ao oponente

---

### Edge Cases

- **O que acontece quando um jogador tenta mover uma peça que não é sua?** Sistema deve impedir o movimento e exibir mensagem indicando que não é o turno do jogador.
- **O que acontece quando há captura obrigatória mas o jogador não a executa?** Sistema deve bloquear qualquer movimento que não seja a captura obrigatória e destacar visualmente as peças que têm capturas disponíveis.
- **O que acontece se uma Dama tenta capturar mas não aterra na primeira casa vazia após a peça capturada?** Sistema deve invalidar o movimento e exigir que a Dama aterrisse imediatamente após a peça capturada.
- **O que acontece se múltiplas sequências de captura têm o mesmo número total de peças capturadas?** Jogador pode escolher qualquer uma das sequências válidas que empate com a Lei da Maioria.
- **O que acontece se um jogador tenta salvar uma partida sem estar autenticado?** Sistema deve exigir login/cadastro antes de permitir salvar partidas.
- **O que acontece se a conexão cai durante uma partida online no meio de uma jogada?** Sistema aguarda 30 segundos para reconexão automática; se reconectar, partida continua do mesmo estado. Caso contrário, inicia timeout de inatividade de 2 minutos; se jogador não retornar, sistema declara derrota por abandono e vitória do oponente.
- **O que acontece se o Bot (IA) encontra um estado de jogo onde todas as jogadas levam à derrota imediata?** Bot deve executar a melhor jogada possível mesmo sabendo que perderá (não travar).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE renderizar um tabuleiro 8x8 com casas alternadas (claras e escuras) e posicionar corretamente 12 peças claras e 12 peças escuras nas três primeiras fileiras de cada lado, ocupando apenas as casas escuras
- **FR-002**: Sistema DEVE permitir apenas movimentos diagonais de uma casa para frente (peças comuns) ou múltiplas casas (Damas) em casas escuras
- **FR-003**: Sistema DEVE aplicar a regra de captura obrigatória: se uma captura é possível, o jogador DEVE executá-la (bloqueando qualquer outro movimento)
- **FR-004**: Sistema DEVE aplicar a Lei da Maioria: se múltiplos caminhos de captura estão disponíveis, o jogador DEVE escolher o caminho que captura o maior número de peças
- **FR-005**: Sistema DEVE permitir capturas tanto para frente quanto para trás (regra brasileira) para peças comuns e Damas
- **FR-006**: Sistema DEVE promover uma peça comum a Dama quando ela alcança a oitava fileira (base do oponente)
- **FR-007**: Sistema DEVE permitir que Damas movam-se em múltiplas casas vazias na diagonal (similar ao Bispo no xadrez) e capturem à distância, aterrissando obrigatoriamente na primeira casa vazia após a peça capturada
- **FR-008**: Sistema DEVE detectar e declarar vitória quando um jogador captura todas as peças do oponente ou quando o oponente não tem movimentos legais e tem menos peças
- **FR-009**: Sistema DEVE detectar e declarar empate quando ambos os jogadores ficam sem movimentos legais e têm o mesmo número de peças
- **FR-010**: Sistema DEVE permitir que um jogador desista a qualquer momento, registrando a desistência como derrota
- **FR-011**: Sistema DEVE suportar modo de jogo local (dois jogadores no mesmo dispositivo alternando turnos)
- **FR-012**: Sistema DEVE suportar modo de jogo online (dois jogadores em dispositivos diferentes) usando sistema de salas com códigos únicos compartilháveis
- **FR-013**: Sistema DEVE suportar modo de jogo contra Bot (IA) com pelo menos três níveis de dificuldade: Fácil, Médio e Difícil
- **FR-014**: Sistema DEVE permitir que usuários autenticados salvem o estado completo de uma partida em andamento
- **FR-015**: Sistema DEVE permitir que usuários autenticados carreguem partidas previamente salvas, restaurando o estado completo (tabuleiro, turno, peças)
- **FR-016**: Sistema DEVE fornecer feedback visual claro para movimentos válidos (ex: destacar casas disponíveis) e inválidos (ex: mensagem de erro, animação de rejeição)
- **FR-017**: Sistema DEVE exibir de forma clara qual é o turno atual (qual jogador deve jogar)
- **FR-018**: Sistema DEVE registrar e exibir o histórico de jogadas de uma partida
- **FR-019**: Sistema DEVE validar todas as jogadas no servidor antes de aplicá-las ao estado do jogo
- **FR-020**: Sistema DEVE persistir dados de usuários autenticados (perfil, estatísticas, partidas salvas) de forma segura
- **FR-021**: Sistema DEVE permitir que usuário autenticado crie uma sala de jogo online gerando automaticamente um código único de 6 caracteres alfanuméricos
- **FR-022**: Sistema DEVE permitir que usuário autenticado entre em uma sala de jogo online informando o código de 6 caracteres
- **FR-023**: Sistema DEVE permitir que usuários entrem como espectadores (modo somente-leitura) em salas com dois jogadores ativos, visualizando o estado do jogo em tempo real sem poder interagir com o tabuleiro
- **FR-024**: Sistema DEVE limitar salas de jogo online a exatamente 2 jogadores ativos, mas permitir número ilimitado de espectadores simultâneos
- **FR-025**: Sistema DEVE registrar em logs estruturados: ações de usuário (autenticação, criação/entrada em salas, salvamento/carregamento de partidas), eventos de jogo (movimentos, capturas, promoções, vitórias/derrotas/empates/desistências), erros de validação, tentativas de movimento inválido, eventos de conexão (conectar/desconectar/reconectar), timeouts de partidas online, e exceções/erros não tratados
- **FR-026**: Sistema DEVE categorizar logs com níveis apropriados (INFO para ações normais, WARN para eventos recuperáveis como reconexões, ERROR para falhas e exceções) e incluir metadados contextuais (userId, gameId, roomCode, timestamp, requestId)
- **FR-027**: Sistema DEVE implementar mecanismo de reconexão automática para partidas online: aguardar 30 segundos após desconexão para reconexão sem penalidade; caso não reconecte, iniciar timeout de inatividade de 2 minutos; se jogador não retornar após timeout total (2min 30s), declarar derrota por abandono e vitória do oponente
- **FR-028**: Sistema DEVE notificar o oponente e espectadores em tempo real sobre o status de conexão do jogador desconectado (desconectado, aguardando reconexão, timeout de inatividade iniciado)
- **FR-029**: Sistema DEVE manter todas as partidas finalizadas (locais, online, contra bot) indefinidamente no perfil do usuário até exclusão manual pelo próprio usuário
- **FR-030**: Sistema DEVE permitir que usuários visualizem histórico completo de partidas finalizadas (data, modo, oponente, resultado, duração) e excluam partidas individualmente ou em lote
- **FR-031**: Sistema DEVE permitir criação ilimitada de salas online por usuário sem restrições de taxa
- **FR-032**: Sistema DEVE automaticamente destruir salas de jogo online que permaneçam sem nenhum jogador ou espectador conectado por mais de 5 minutos, liberando recursos do servidor

### Key Entities

- **Tabuleiro (Board)**: Representa o estado do jogo com 64 casas (8x8), contendo a posição atual de todas as peças (claras e escuras), identificação de casas válidas (escuras) e histórico de movimentos
- **Peça (Piece)**: Representa uma peça no jogo com atributos: cor (clara/escura), tipo (comum/Dama), posição atual (linha e coluna), e status (ativa/capturada)
- **Jogador (Player)**: Representa um participante do jogo com atributos: identificador único, tipo (humano local/humano online/Bot), cor das peças (claro/escuro), estatísticas (partidas jogadas, vitórias, derrotas, empates)
- **Partida (Game)**: Representa uma sessão de jogo com atributos: identificador único, modo de jogo (local/online/Bot), estado do tabuleiro, jogador ativo (turno atual), histórico de jogadas, status (em andamento/finalizada), resultado (vitória jogador 1/vitória jogador 2/empate/desistência), timestamp de criação e última atualização
- **Movimento (Move)**: Representa uma jogada com atributos: peça movida, posição de origem, posição de destino, peças capturadas (se houver), promoção a Dama (se aplicável), timestamp
- **Usuário (User)**: Representa um usuário autenticado com atributos: identificador único, credenciais de autenticação, perfil (nome, avatar), partidas salvas, estatísticas globais

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários podem completar uma partida local completa (do início até vitória/derrota/empate) sem erros ou travamentos em 100% dos casos testados
- **SC-002**: Sistema detecta e aplica captura obrigatória corretamente em 100% dos cenários de teste onde uma captura é possível
- **SC-003**: Sistema aplica a Lei da Maioria corretamente em 100% dos cenários com múltiplos caminhos de captura
- **SC-004**: Promoção a Dama ocorre automaticamente e corretamente em 100% dos casos onde uma peça alcança a oitava fileira
- **SC-005**: Usuários conseguem salvar e carregar partidas sem perda de dados em 100% dos testes (estado do tabuleiro restaurado identicamente)
- **SC-006**: Partidas online sincronizam jogadas entre dois jogadores em menos de 1 segundo em 95% dos casos com latência de rede inferior a 200ms
- **SC-007**: Bot (IA) executa jogadas válidas dentro de 3 segundos em 100% dos casos
- **SC-008**: Interface fornece feedback visual claro para movimentos válidos e inválidos, confirmado por 90% dos usuários em testes de usabilidade
- **SC-009**: Sistema é responsivo e funciona corretamente em dispositivos desktop e mobile (tablets e smartphones) com resolução mínima de 768x1024
- **SC-010**: 95% dos usuários conseguem iniciar e jogar uma partida completa sem consultar documentação ou ajuda externa

### Assumptions

- **Assumimos** que partidas online ocorrerão em redes com latência inferior a 500ms para garantir experiência fluida
- **Assumimos** que o Bot (IA) usará algoritmo Minimax com poda alpha-beta para níveis Médio e Difícil, e jogadas aleatórias válidas para nível Fácil
- **Assumimos** que autenticação de usuários seguirá padrão da constituição (Better-Auth) para salvar/carregar partidas e estatísticas
- **Assumimos** que o sistema suportará navegadores modernos (Chrome, Firefox, Safari, Edge) nas últimas 2 versões principais
- **Assumimos** que todas as partidas finalizadas (locais, online, contra bot) são mantidas indefinidamente no perfil do usuário até que ele decida excluí-las manualmente
- **Assumimos** que o limite de partidas salvas (em andamento) por usuário será de 50 partidas para evitar sobrecarga de armazenamento; partidas finalizadas não têm limite
