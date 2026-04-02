# Changelog — MuscleQuest

## [Unreleased]

### Correções
- **Histórico:** alinhamento do badge de status corrigido quando o nome do treino ocupa mais de uma linha (`alignItems: flex-start` no cabeçalho do card)
- **Registrar:** tamanho dos botões "Planejar" e "Registrar concluído" reduzido para melhor proporção visual
- **Registrar:** `KeyboardAvoidingView` ajustado para Android (`behavior="padding"`, `keyboardVerticalOffset=110`) nas telas de registro e criação de treinos padrão
- **Templates:** fundo branco e visibilidade de campos no teclado corrigidos no formulário de treino padrão
- **Histórico:** formato de data alterado para DD/MM/AAAA

### Funcionalidades
- **Registrar:** botão `?` com modal explicativo sobre os modos "Planejar" e "Registrar concluído" — inclui descrição de como cada modo interage com XP, sequência e meta semanal
- **Templates (seed):** 7 treinos padrão pré-definidos inseridos automaticamente na primeira inicialização do app, cobrindo dois splits:
  - *Split ABC — Iniciante:* A (Peito/Ombros/Tríceps), B (Costas/Bíceps), C (Pernas/Abdômen)
  - *Split 5 Dias — Hipertrofia:* Segunda (Peito/Tríceps), Terça (Costas/Bíceps), Quinta (Pernas/Glúteos), Sexta (Ombros/Braços)
- **Templates:** opção de editar treino padrão diretamente pela aba Criar
- **Templates:** aba dedicada "Criar" com navegação via Stack (corrige bug de aba invisível ocupando espaço)
- **Histórico:** cards colapsáveis — exercícios ocultos por padrão, expandem ao toque
- **Histórico:** filtros por Semana, Mês e Geral
- **Início:** seção "Treinos desta semana" com status de cada treino da semana atual
- **Início:** título de nível (ex.: "Frango de Granja", "Titã de Aço") e tabela de progressão interativa
- **Início:** modal de sequência e modal de meta semanal (1–7 treinos) acessíveis por toque nos cards

### UX / Visual
- **Registrar:** botão "Usar treino padrão" em azul (`#00BFFF`), consistente com o card de meta semanal
- **Templates:** botão "Editar" em azul (`#00BFFF`)
- **Início:** cor do status "Planejado" em "Treinos desta semana" alterada para cinza (`#CCCCCC`) e ponto indicador com opacidade reduzida — consistente com a aba Histórico
- **Início:** mensagem de semana vazia atualizada para mencionar a opção de registrar treinos já concluídos
- **Registrar:** mensagem incentivando criação de treino padrão quando nenhum existe