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
- Meta semanal de treinos com progresso visual
- Detecção automática de evolução de carga nos exercícios

### Tela Histórico
- Lista de todos os treinos registrados (mais recentes primeiro)
- Detalhe de exercícios, grupos musculares, séries, repetições e cargas
- Opção de marcar treinos planejados como concluídos (+20 XP)

### Tela Registrar
- Formulário para criar treinos com múltiplos exercícios
- Seleção de grupo muscular por exercício
- Adição dinâmica de séries com repetições e carga
- Modo "Planejar" (salva como planejado) ou "Registrar concluído" (+20 XP imediato)

## Gamificação

- **XP**: cada treino concluído concede 20 XP
- **Níveis**: cada nível requer `nível × 100` XP (nível 1 = 100 XP, nível 2 = 200 XP...)
- **Streak**: incrementa a cada treino concluído, exibindo sequência de dias
- **Evolução**: detecta automaticamente aumentos de carga em exercícios e exibe na Home

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
│   ├── ProgressBar.js
│   └── StatCard.js
├── database/
│   └── db.js
├── navigation/
│   └── AppNavigator.js
├── screens/
│   ├── HomeScreen.js
│   ├── WorkoutListScreen.js
│   └── CreateWorkoutScreen.js
└── store/
    └── useUserStore.js
```
