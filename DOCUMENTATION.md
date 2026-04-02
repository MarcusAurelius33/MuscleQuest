# MuscleQuest

App mobile de registro, armazenamento e planejamento de treinos gamificado.

## Stack

- **React Native** com Expo SDK 54
- **SQLite** (`expo-sqlite`) para persistência local
- **Zustand** para estado global
- **React Navigation** (Stack + Bottom Tabs) para navegação

## Funcionalidades

### Tela Início
- Nível, título do nível (ex.: "Frango de Granja", "Titã de Aço") e barra de XP; toque abre tabela completa de progressão
- Contador de sequência (streak) de dias com treino; toque exibe modal com detalhes
- Meta semanal configurável (1–7 treinos); toque abre modal para alterar a meta
- Seção "Treinos desta semana" com todos os treinos da semana atual e seus status
- Seção "Desempenho" com um card por exercício que teve variação de carga entre as duas sessões mais recentes:
  - **Verde** — evolução: carga recente maior que a sessão anterior
  - **Vermelho** — queda: carga recente menor que a sessão anterior
  - Toque no card expande e exibe nome e data do treino de cada sessão comparada

### Tela Histórico
- Filtros por **Semana**, **Mês** e **Geral**
- Cards colapsáveis — exercícios ocultos por padrão, expandem ao toque
- Detalhe de exercícios, grupos musculares, séries, repetições e cargas
- Opção de marcar treinos planejados como concluídos (+20 XP), disponível apenas para treinos de hoje ou de datas passadas
- Exclusão de treinos com reversão automática de XP e liberação do dia

### Tela Registrar
- Seletor de data nativo (calendário Android)
- Limite de 1 treino por dia — o formulário bloqueia datas já ocupadas
- Ao retornar para a aba o formulário é resetado e a data é revalidada automaticamente
- Botão **Usar treino padrão** para pré-preencher o formulário a partir de um template salvo
- Formulário com múltiplos exercícios, seleção de grupo muscular por chips horizontais
- Adição dinâmica de séries com repetições e carga
- Modo **Planejar** (salva como planejado) ou **Registrar concluído** (+20 XP imediato)
- Botão `?` com modal explicativo sobre os dois modos e como cada um interage com XP, sequência e meta semanal

### Tela Criar (Treinos Padrão)
- Listagem de treinos padrão com cards colapsáveis
- Criação de treinos padrão com exercícios, grupos musculares e séries pré-definidas
- Edição de treinos padrão existentes
- Exclusão de treinos padrão
- **Seed automático**: 7 treinos padrão pré-definidos são inseridos na primeira inicialização:
  - *Split ABC — Iniciante:* A (Peito/Ombros/Tríceps), B (Costas/Bíceps), C (Pernas/Abdômen)
  - *Split 5 Dias — Hipertrofia:* Segunda (Peito/Tríceps), Terça (Costas/Bíceps), Quinta (Pernas/Glúteos), Sexta (Ombros/Braços)

## Gamificação

- **XP**: cada treino concluído concede 20 XP; excluir um treino concluído reverte o XP
- **Níveis**: cada nível requer `nível × 100` XP (nível 1 = 100 XP, nível 2 = 200 XP...)
  - Ao subir de nível o XP excedente é carregado; ao descer de nível o XP é recalculado
- **Streak**: incrementa a cada treino concluído; decrementa ao excluir um treino concluído
- **Variação de carga**: compara a carga máxima da sessão mais recente com a sessão imediatamente anterior do mesmo exercício, agrupando por ID de treino (detecta variação mesmo entre treinos no mesmo dia)

## Banco de dados

```
workouts          (id, name, date, status, xpEarned)
exercises         (id, workout_id, muscle_group, name)
sets              (id, exercise_id, set_number, reps, weight)
workout_templates (id, name)
template_exercises(id, template_id, name, muscle_group)
template_sets     (id, template_exercise_id, set_number, reps, weight)
```

## Como Executar (Ambiente Local)

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **[Git](https://git-scm.com/):** Para clonar o repositório.
- **[Node.js](https://nodejs.org/)** (versão 18 ou superior): Ambiente de execução JavaScript.
- **[Expo Go](https://expo.dev/go):** Aplicativo instalado no celular Android para rodar o app sem build nativo.
- Celular e computador **na mesma rede WiFi** para a comunicação via Metro Bundler.

---

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/MarcusAurelius33/MuscleQuest.git
cd MuscleQuest
```

### Passo 2: Instalar as Dependências

```bash
npm install
```

Todas as dependências declaradas no `package.json` serão instaladas, incluindo Expo SDK, React Navigation, expo-sqlite e Zustand.

### Passo 3: Iniciar o Servidor de Desenvolvimento

```bash
npx expo start
```

O Metro Bundler será iniciado e exibirá um QR Code no terminal.

### Passo 4: Abrir no Dispositivo

Com o aplicativo **Expo Go** aberto no celular:

- **Android:** escaneie o QR Code exibido no terminal com a câmera do Expo Go.
- O app será compilado e aberto automaticamente no dispositivo.

> **Atenção:** o celular e o computador devem estar na mesma rede WiFi. Caso o app não carregue, verifique se o firewall do sistema não está bloqueando a porta `8081`.

### Passo 5: Banco de Dados

Nenhuma configuração manual é necessária. O banco SQLite (`musclequest.db`) é criado automaticamente no primeiro acesso, dentro do armazenamento local do dispositivo.

## Estrutura do projeto

```
src/
├── components/
│   ├── AppAlert.js         ← modal de alerta customizado (substitui Alert nativo)
│   ├── ProgressBar.js      ← barra de progresso animada (XP, meta semanal)
│   └── StatCard.js         ← card de estatística clicável (streak, meta)
├── database/
│   └── db.js               ← CRUD completo: treinos, exercícios, séries, templates e analytics; seed automático
├── navigation/
│   └── AppNavigator.js     ← Stack Navigator (raiz) + Bottom Tab Navigator (4 abas)
├── screens/
│   ├── HomeScreen.js           ← dashboard: XP, streak, meta, treinos da semana, desempenho
│   ├── WorkoutListScreen.js    ← histórico com filtros, cards colapsáveis, conclusão e exclusão
│   ├── CreateWorkoutScreen.js  ← formulário com calendário, templates e validação de dia
│   ├── TemplatesScreen.js      ← listagem e gestão de treinos padrão
│   └── CreateTemplateScreen.js ← criação e edição de treinos padrão
└── store/
    └── useUserStore.js     ← Zustand: level, xp, weeklyGoal
```

## Histórico de versões

| Versão | Descrição |
|--------|-----------|
| Setup  | Arquitetura limpa, navegação, banco SQLite, telas base e gamificação |
| v1.1   | Calendário nativo para data e limite de 1 treino por dia |
| v1.2   | Comparação de carga entre sessões consecutivas (evolução e queda) |
| v1.3   | Exclusão de treino com reversão de XP, streak e liberação do dia |
| v1.4   | Cards de variação para todos os exercícios na tela inicial |
| v1.5   | Cards expansíveis com nome e data dos treinos comparados |
| v1.6   | Agrupamento por ID do treino para detectar variação no mesmo dia |
| v1.7   | Reset do formulário e revalidação de data ao retornar para a aba |
| v1.8   | Streak calculado dinamicamente a partir das datas reais do banco (dias consecutivos) |
| v1.9   | Validação de data nos modos Planejar/Concluído: passado força conclusão, futuro força planejamento |
| v2.0   | Sistema de treinos padrão (templates): criação, edição, exclusão e seleção no formulário de registro |
| v2.1   | Seed automático de 7 treinos padrão pré-definidos (splits ABC e 5 dias) na primeira inicialização |
| v2.2   | Histórico com filtros por Semana/Mês/Geral e cards colapsáveis |
| v2.3   | Título de nível, tabela de progressão, modal de streak, modal e validação de meta semanal (1–7) |
| v2.4   | Seção "Treinos desta semana" na tela Início com status por treino |
| v2.5   | Navegação reestruturada: Stack Navigator raiz + 4 abas (Criar substitui aba de templates oculta) |
| v2.6   | Paleta de cores: botões de edição/template em azul (#00BFFF); status "Planejado" em cinza na Home |
| v2.7   | Botão `?` com modal explicativo dos modos Planejar e Registrar concluído |
| v2.8   | Correção de layout no Histórico: badge não conflita com nomes longos de treino |