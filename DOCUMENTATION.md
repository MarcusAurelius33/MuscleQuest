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
- Detecção de variação de carga nos exercícios:
  - **Verde** — evolução: carga recente superou o máximo histórico
  - **Vermelho** — queda: carga recente abaixo do máximo histórico

### Tela Histórico
- Lista de todos os treinos registrados (mais recentes primeiro)
- Detalhe de exercícios, grupos musculares, séries, repetições e cargas
- Opção de marcar treinos planejados como concluídos (+20 XP)
- Exclusão de treinos com reversão automática de XP, streak e liberação do dia

### Tela Registrar
- Seletor de data nativo (calendário Android)
- Limite de 1 treino por dia — o formulário bloqueia datas já ocupadas
- Formulário com múltiplos exercícios, seleção de grupo muscular por chips horizontais
- Adição dinâmica de séries com repetições e carga
- Modo **Planejar** (salva como planejado) ou **Registrar concluído** (+20 XP imediato)

## Gamificação

- **XP**: cada treino concluído concede 20 XP; excluir um treino concluído reverte o XP
- **Níveis**: cada nível requer `nível × 100` XP (nível 1 = 100 XP, nível 2 = 200 XP...)
  - Ao subir de nível o XP excedente é carregado; ao descer de nível o XP é recalculado
- **Streak**: incrementa a cada treino concluído; decrementa ao excluir um treino concluído
- **Evolução/Queda**: compara a carga máxima da sessão mais recente contra o maior valor histórico de todas as sessões anteriores do mesmo exercício

## Banco de dados

```
workouts  (id, name, date, status, xpEarned)
exercises (id, workout_id, muscle_group, name)
sets      (id, exercise_id, set_number, reps, weight)
```

## Como rodar

```bash
npm install
npx expo start
```

Com o emulador Android aberto no Android Studio, pressione `a` no terminal do Expo.

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
│   ├── HomeScreen.js           ← dashboard gamificado
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
| v1.2   | Comparação de carga com máximo histórico (evolução e queda de desempenho) |
| v1.3   | Exclusão de treino com reversão de XP, streak e liberação do dia |
