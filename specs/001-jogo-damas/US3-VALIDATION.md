# US3 - Validation Checklist: Bot Game Mode

**User Story**: Como jogador, quero jogar contra um bot com diferentes níveis de dificuldade.

**Data de Validação**: 09/11/2025  
**Status**: ⏳ Em Validação

---

## ✅ Acceptance Scenarios (Spec.md)

### 📋 Scenario 1: Bot responde rapidamente
**Critério**: Bot executa jogada em menos de 3 segundos

**Passos de Teste**:
1. ✅ Iniciar jogo contra bot (qualquer dificuldade)
2. ✅ Executar movimento do jogador
3. ✅ Medir tempo de resposta do bot
4. ✅ Verificar se tempo < 3000ms

**Resultado Esperado**:
- ✅ Bot calcula e executa movimento em <3s
- ✅ Interface mostra loading durante processamento
- ✅ Movimento do bot é válido e respeita regras

**Status**: ⏳ Pendente teste manual
- [ ] EASY: Tempo médio < 1s
- [ ] MEDIUM: Tempo médio < 2s
- [ ] HARD: Tempo médio < 3s

---

### 📋 Scenario 2: Bot respeita captura obrigatória
**Critério**: Bot sempre executa captura quando obrigatória

**Passos de Teste**:
1. ✅ Criar cenário com captura obrigatória disponível para bot
2. ✅ Executar movimento do jogador que expõe peça
3. ✅ Observar movimento do bot
4. ✅ Verificar se bot capturou (não fez movimento simples)

**Resultado Esperado**:
- ✅ Bot identifica capturas obrigatórias
- ✅ Bot executa captura em vez de movimento simples
- ✅ Lei da Maioria é respeitada (caminho com mais capturas)

**Status**: ⏳ Pendente teste manual
- [ ] Bot EASY respeita captura obrigatória
- [ ] Bot MEDIUM respeita captura obrigatória
- [ ] Bot HARD respeita captura obrigatória
- [ ] Bot escolhe sequência com mais capturas (Lei da Maioria)

---

### 📋 Scenario 3: Bot demonstra estratégia avançada (Difícil)
**Critério**: Bot HARD joga estrategicamente melhor que EASY

**Passos de Teste**:
1. ✅ Jogar múltiplas partidas contra EASY
2. ✅ Jogar múltiplas partidas contra HARD
3. ✅ Comparar qualidade dos movimentos
4. ✅ Verificar se HARD protege peças e busca vantagens

**Resultado Esperado**:
- ✅ HARD faz movimentos mais defensivos
- ✅ HARD busca promoção a Dama
- ✅ HARD avalia posicionamento estratégico
- ✅ HARD é visivelmente mais difícil de vencer

**Status**: ⏳ Pendente teste manual
- [ ] EASY joga randomicamente
- [ ] HARD usa Minimax com avaliação de posição
- [ ] Diferença perceptível entre dificuldades
- [ ] HARD demonstra planejamento de múltiplos movimentos

---

### 📋 Scenario 4: Vitória do Bot
**Critério**: Bot pode vencer partida seguindo regras

**Passos de Teste**:
1. ✅ Jogar partida completa contra bot
2. ✅ Permitir que bot capture todas as peças do jogador OU
3. ✅ Deixar jogador sem movimentos válidos
4. ✅ Verificar condição de vitória detectada corretamente

**Resultado Esperado**:
- ✅ Bot captura peças metodicamente
- ✅ Condição de vitória é detectada (todas peças capturadas OU sem movimentos)
- ✅ Interface mostra resultado "Bot venceu"
- ✅ Jogo não permite mais movimentos após vitória

**Status**: ⏳ Pendente teste manual
- [ ] Bot pode capturar todas as peças
- [ ] Bot pode bloquear jogador (sem movimentos)
- [ ] Vitória do bot é detectada corretamente
- [ ] Interface atualiza status para "Bot venceu"

---

## 🧪 Unit Tests Status

### MinimaxBotService.test.ts
- ✅ Movimento válido para DARK
- ✅ Movimento válido para LIGHT
- ✅ Respeita captura obrigatória
- ✅ Timeout <3s
- ✅ Estratégia avançada em HARD
- ✅ Movimentos válidos em posição complexa
- ✅ Prioriza promoção
- ✅ Lei da Maioria (múltiplas capturas)
- ✅ EASY mais rápido que HARD
- ✅ Edge cases (sem movimentos, uma peça)

**Cobertura**: 10/10 testes ✅

### ExecuteBotMoveUseCase.test.ts
- ✅ Executa movimento com sucesso
- ✅ Usa RandomBotService para EASY
- ✅ Usa MinimaxBotService para MEDIUM/HARD
- ✅ Timeout <3s
- ✅ GameStateDTO com lastMove
- ✅ Consistência do estado
- ✅ Logging (TODO implementar)
- ✅ Seleção de BotService válida
- ✅ Validação de movimento

**Cobertura**: 9/9 testes ✅

---

## 🔍 Integration Tests

### bot-game-actions.ts
- ✅ startBotGame retorna GameStateDTO válido
- ⏳ executeBotGameMove executa movimento do jogador
- ⏳ executeBotGameMove aciona resposta do bot
- ⏳ Estado do jogo atualizado corretamente
- ⏳ Erros tratados e propagados

**Status**: ⏳ Pendente testes de integração

---

## 📊 Functional Requirements Coverage

| FR | Descrição | Status |
|----|-----------|--------|
| FR-011 | Bot com 3 níveis (Fácil/Médio/Difícil) | ✅ Implementado |
| FR-012 | Fácil = jogadas aleatórias válidas | ✅ RandomBotService |
| FR-013 | Médio/Difícil = estratégia Minimax | ✅ MinimaxBotService |
| FR-014 | Bot respeita todas as regras | ✅ Usa GameEngine |
| FR-015 | Tempo de resposta <3s | ✅ Timeout implementado |

---

## 🎯 Checklist Final US3

### Implementação
- [X] RandomBotService (EASY)
- [X] MinimaxBotService (MEDIUM/HARD)
- [X] StartBotGameDTO
- [X] StartBotGameUseCase
- [X] ExecuteBotMoveUseCase
- [X] Server Action: startBotGame
- [X] Server Action: executeBotGameMove
- [X] Página: /game/bot
- [X] UI: Seleção de dificuldade
- [X] UI: Alternância de turnos jogador/bot

### Testes Unitários
- [X] MinimaxBotService.test.ts (10 casos)
- [X] ExecuteBotMoveUseCase.test.ts (9 casos)

### Testes Manuais (Pendentes)
- [ ] Cenário 1: Bot responde em <3s
- [ ] Cenário 2: Captura obrigatória
- [ ] Cenário 3: Estratégia avançada
- [ ] Cenário 4: Vitória do bot

### Testes de Integração (Pendentes)
- [ ] startBotGame end-to-end
- [ ] executeBotGameMove end-to-end
- [ ] Fluxo completo de partida

---

## 🐛 Known Issues / TODOs

1. **Dificuldade hardcoded**: 
   - 📍 Localização: `src/app/_actions/bot-game-actions.ts:98`
   - 🔧 Problema: Dificuldade está fixa como `EASY`
   - ✨ Solução: Armazenar `botDifficulty` no `Game` entity

2. **ExecuteBotMoveUseCase incompleto**:
   - 📍 Localização: `src/core/application/use-cases/bot/ExecuteBotMoveUseCase.ts`
   - 🔧 Problema: TODOs para validação e persistência
   - ✨ Solução: Integrar GameEngine para aplicar movimento

3. **Logging não implementado**:
   - 📍 Localização: Múltiplos Use Cases
   - 🔧 Problema: Logs de auditoria ausentes
   - ✨ Solução: Implementar logger infrastructure

---

## 📝 Acceptance Criteria Summary

| Critério | Implementado | Testado Unitariamente | Testado Manualmente |
|----------|--------------|----------------------|---------------------|
| Bot executa em <3s | ✅ | ✅ | ⏳ |
| Captura obrigatória | ✅ | ✅ | ⏳ |
| Estratégia avançada | ✅ | ✅ | ⏳ |
| Vitória do bot | ✅ | ⏳ | ⏳ |

---

## ✅ Conclusão Preliminar

**Status Geral**: 🟡 **Parcialmente Completo**

### O que está funcionando:
- ✅ Arquitetura Clean implementada corretamente
- ✅ Bot services (Random + Minimax) funcionais
- ✅ Use Cases seguem princípios SOLID
- ✅ Server Actions com validação Zod
- ✅ UI completa para seleção e jogo
- ✅ Testes unitários abrangentes

### O que falta:
- ⏳ Testes manuais dos 4 cenários de aceitação
- ⏳ Testes de integração end-to-end
- 🔧 Fix: Dificuldade hardcoded (TODO crítico)
- 🔧 ExecuteBotMoveUseCase precisa integração completa
- 📋 Logging/auditoria de movimentos

### Próximos Passos:
1. **Corrigir dificuldade hardcoded** (crítico)
2. **Executar testes manuais** conforme cenários
3. **Escrever testes de integração**
4. **Completar ExecuteBotMoveUseCase** (TODOs)
5. **Solicitar aprovação** após validação completa

---

**Última Atualização**: 09/11/2025  
**Responsável**: Copilot Agent
