# MuscleQuest

App mobile de registro, armazenamento e planejamento de treinos gamificado.

## Stack

- **React Native** com Expo SDK 54
- **SQLite** (`expo-sqlite`) para persistência local
- **Zustand** para estado global
- **React Navigation** (Bottom Tabs) para navegação

## Funcionalidades

### Tela Início
- Nível e barra de XP do usuário
- Contador de sequência (streak) de dias com treino
- Meta semanal de treinos com barra de progresso
- Seção "Variação de Carga" com um card por exercício que teve mudança entre as duas sessões mais recentes:
  - **Verde** — evolução: carga recente maior que a sessão anterior
  - **Vermelho** — queda: carga recente menor que a sessão anterior
  - Toque no card expande e exibe nome e data do treino de cada sessão comparada

### Tela Histórico
- Lista de todos os treinos registrados (mais recentes primeiro)
- Detalhe de exercícios, grupos musculares, séries, repetições e cargas
- Opção de marcar treinos planejados como concluídos (+20 XP)
- Exclusão de treinos com reversão automática de XP, streak e liberação do dia

### Tela Registrar
- Seletor de data nativo (calendário Android)
- Limite de 1 treino por dia — o formulário bloqueia datas já ocupadas
- Ao retornar para a aba o formulário é resetado e a data é revalidada automaticamente
- Formulário com múltiplos exercícios, seleção de grupo muscular por chips horizontais
- Adição dinâmica de séries com repetições e carga
- Modo **Planejar** (salva como planejado) ou **Registrar concluído** (+20 XP imediato)

## Gamificação

- **XP**: cada treino concluído concede 20 XP; excluir um treino concluído reverte o XP
- **Níveis**: cada nível requer `nível × 100` XP (nível 1 = 100 XP, nível 2 = 200 XP...)
  - Ao subir de nível o XP excedente é carregado; ao descer de nível o XP é recalculado
- **Streak**: incrementa a cada treino concluído; decrementa ao excluir um treino concluído
- **Variação de carga**: compara a carga máxima da sessão mais recente com a sessão imediatamente anterior do mesmo exercício, agrupando por ID de treino (detecta variação mesmo entre treinos no mesmo dia)

## Banco de dados

```
workouts  (id, name, date, status, xpEarned)
exercises (id, workout_id, muscle_group, name)
sets      (id, exercise_id, set_number, reps, weight)
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
│   ├── ProgressBar.js      ← barra de progresso animada (XP, meta semanal)
│   └── StatCard.js         ← card de estatística (streak, meta)
├── database/
│   └── db.js               ← CRUD completo: treinos, exercícios, séries e analytics
├── navigation/
│   └── AppNavigator.js     ← Bottom Tab Navigator (Início / Histórico / Registrar)
├── screens/
│   ├── HomeScreen.js           ← dashboard gamificado com cards expansíveis
│   ├── WorkoutListScreen.js    ← histórico com conclusão e exclusão
│   └── CreateWorkoutScreen.js  ← formulário com calendário e validação de dia
└── store/
    └── useUserStore.js     ← Zustand: level, xp, streak, weeklyGoal
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