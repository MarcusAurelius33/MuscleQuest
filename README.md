# 💪 MuscleQuest — Documentação do Projeto

## 📋 1. Descrição do Projeto

O **MuscleQuest** é um aplicativo mobile de registro e planejamento de treinos com elementos de gamificação. O objetivo é tornar a consistência nos treinos mais engajante, permitindo ao usuário acompanhar sua evolução através de XP, níveis, sequências e metas semanais, além de comparar a variação de carga entre sessões consecutivas.

O app funciona **100% offline**, com persistência local via SQLite, sem necessidade de cadastro ou conexão com internet.

---

## 🧠 2. Conceitos Abordados

- **Gamificação:** Sistema de XP, níveis com títulos, streak de dias consecutivos e meta semanal configurável
- **Persistência Local:** Banco SQLite gerenciado via `expo-sqlite` com API síncrona
- **Gerenciamento de Estado Global:** Zustand para XP, nível e meta semanal, com persistência entre sessões
- **Navegação Composta:** Stack Navigator envolvendo Bottom Tab Navigator para separação de fluxos de tela
- **Templates de Treino:** Sistema de treinos padrão reutilizáveis com seed automático na primeira inicialização
- **Analytics Locais:** Comparação de carga entre sessões consecutivas por exercício, agrupando por ID de treino
- **Validação de Regras de Negócio:** Limite de 1 treino por data, restrição de modos por data (passado/hoje/futuro), validação de séries

---

## 🏗️ 3. Arquitetura e Tecnologias

O app utiliza uma arquitetura em camadas com separação entre navegação, telas, estado global e acesso a dados.

| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| **React Native** | 0.76 | Framework base para desenvolvimento mobile multiplataforma |
| **Expo** | SDK 54 | Toolchain de build, acesso a APIs nativas e distribuição |
| **expo-sqlite** | 16 | Banco de dados relacional local com API síncrona |
| **Zustand** | ^5 | Gerenciamento de estado global leve e persistente |
| **React Navigation** | ^7 | Navegação Stack + Bottom Tabs |
| **@react-native-community/datetimepicker** | 8.4.4 | Seletor de data nativo Android |
| **EAS Build** | - | Build e distribuição do APK via Expo Application Services |

---

## 🎮 4. Gamificação

- **XP:** cada treino concluído concede 20 XP; excluir um treino concluído reverte o XP
- **Níveis:** cada nível requer `nível × 100` XP — ao subir de nível o XP excedente é carregado; ao descer é recalculado
- **Títulos de nível:** cada faixa de nível possui um título desbloqueável (ex.: "Frango de Granja", "Geladeira Electrolux", "Titã de Aço", "Herdeiro do Olimpo")
- **Streak:** incrementa a cada dia com pelo menos um treino concluído; calculado dinamicamente pelas datas reais do banco
- **Meta semanal:** configurável de 1 a 7 treinos por semana; progresso exibido na tela Início

---

## 🗄️ 5. Modelo de Dados (SQLite)

```
workouts           (id, name, date, status, xpEarned)
exercises          (id, workout_id, name, muscle_group)
sets               (id, exercise_id, set_number, reps, weight)
workout_templates  (id, name)
template_exercises (id, template_id, name, muscle_group)
template_sets      (id, template_exercise_id, set_number, reps, weight)
```

---

## 📱 6. Telas e Funcionalidades

### 🏠 Início
- Nível, título e barra de XP — toque abre tabela completa de progressão
- Streak de dias consecutivos — toque exibe modal com detalhes
- Meta semanal — toque abre modal para alterar (1–7 treinos)
- Seção **Treinos desta semana** com status de cada treino
- Seção **Desempenho** com variação de carga por exercício (verde = evolução, vermelho = queda), expansível ao toque

### 📋 Histórico
- Filtros por **Semana**, **Mês** e **Geral**
- Cards colapsáveis — exercícios ocultos por padrão
- Opção de marcar treinos planejados como concluídos (+20 XP)
- Exclusão de treinos com reversão automática de XP e liberação do dia

### ✏️ Registrar
- Seletor de data nativo (calendário Android)
- Botão **Usar treino padrão** para pré-preencher o formulário a partir de um template
- Limite de 1 treino por dia com bloqueio visual da data
- Modos **Planejar** e **Registrar concluído** com validação por data (passado força conclusão, futuro força planejamento)
- Botão `?` com modal explicativo sobre os dois modos
- Adição dinâmica de exercícios e séries com grupo muscular por chips horizontais

### 📁 Criar (Treinos Padrão)
- Listagem, criação, edição e exclusão de treinos padrão
- **Seed automático** de 7 treinos na primeira inicialização:
  - *Split ABC — Iniciante:* A (Peito/Ombros/Tríceps), B (Costas/Bíceps), C (Pernas/Abdômen)
  - *Split 5 Dias — Hipertrofia:* Segunda (Peito/Tríceps), Terça (Costas/Bíceps), Quinta (Pernas/Glúteos), Sexta (Ombros/Braços)

---

## 🛠️ 7. Tratamento de Erros e Validações

- **Data ocupada:** impede salvar dois treinos no mesmo dia; exibe badge "Dia ocupado" e bloqueia o botão salvar
- **Campos vazios:** alerta customizado (`AppAlert`) ao tentar salvar sem nome de treino, exercício ou séries incompletas
- **Repetições zeradas:** impede salvar séries com 0 repetições
- **Meta semanal:** aceita apenas valores inteiros entre 1 e 7
- **Exclusão:** confirmação via `AppAlert` antes de deletar treino ou treino padrão
- **Alertas nativos substituídos:** todos os alertas usam o componente `AppAlert` (modal customizado) para consistência visual

---

## 🗂️ 8. Estrutura do Projeto

```
MuscleQuest/
├── assets/
│   └── icons/              ← ícones PNG das abas e cards
├── src/
│   ├── components/
│   │   ├── AppAlert.js         ← modal de alerta customizado
│   │   ├── ProgressBar.js      ← barra de progresso animada
│   │   └── StatCard.js         ← card de estatística clicável
│   ├── database/
│   │   └── db.js               ← CRUD, analytics e seed automático de templates
│   ├── navigation/
│   │   └── AppNavigator.js     ← Stack Navigator + Bottom Tab (4 abas)
│   ├── screens/
│   │   ├── HomeScreen.js           ← dashboard gamificado
│   │   ├── WorkoutListScreen.js    ← histórico com filtros e cards colapsáveis
│   │   ├── CreateWorkoutScreen.js  ← formulário com calendário e templates
│   │   ├── TemplatesScreen.js      ← listagem e gestão de treinos padrão
│   │   └── CreateTemplateScreen.js ← criação e edição de treinos padrão
│   └── store/
│       └── useUserStore.js     ← Zustand: level, xp, weeklyGoal
├── app.json                ← configuração Expo + EAS projectId
├── eas.json                ← perfis de build (preview APK)
├── CHANGELOG.md
└── DOCUMENTATION.md
```

---

## 🎬 9. Vídeo de Demonstração

> 🔗 *Em breve — será adicionado um vídeo demonstrando o fluxo completo do app: registro de treino, gamificação, histórico com filtros e uso de treinos padrão.*

---

## 🚀 10. Versão em Deploy

| Versão | Data | Link |
| :--- | :--- | :--- |
| **v2.x** — Templates, Filtros, UX avançado | 2026-04 | [Download APK](https://github.com/MarcusAurelius33/MuscleQuest/releases/download/v2.0.0/MuscleQuest-v2.0.0.apk) |

> Os builds são gerados via **EAS Build** (`eas build -p android --profile preview`) e distribuídos como APK direto para Android.

---

## ▶️ 11. Como Executar (Ambiente Local)

### Pré-requisitos

- **[Git](https://git-scm.com/)**
- **[Node.js](https://nodejs.org/)** 18 ou superior
- **[Expo Go](https://expo.dev/go)** instalado no celular Android
- Celular e computador **na mesma rede Wi-Fi**

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/MarcusAurelius33/MuscleQuest.git
cd MuscleQuest
```

### Passo 2 — Instalar dependências

```bash
npm install
```

### Passo 3 — Iniciar o servidor de desenvolvimento

```bash
npx expo start
```

### Passo 4 — Abrir no dispositivo

Com o **Expo Go** aberto no celular, escaneie o QR Code exibido no terminal. O app será compilado e aberto automaticamente.

> O banco SQLite é criado automaticamente na primeira inicialização. Os 7 treinos padrão são inseridos automaticamente nessa primeira abertura.

---

## 📜 12. Histórico de Versões

| Versão | Descrição |
| :--- | :--- |
| Setup | Arquitetura base, navegação, banco SQLite, telas e gamificação |
| v1.1 | Calendário nativo e limite de 1 treino por dia |
| v1.2 | Comparação de carga entre sessões (evolução e queda) |
| v1.3 | Exclusão de treino com reversão de XP e streak |
| v1.4 | Cards de variação para todos os exercícios |
| v1.5 | Cards expansíveis com nome e data dos treinos comparados |
| v1.6 | Agrupamento por ID para detectar variação no mesmo dia |
| v1.7 | Reset do formulário e revalidação de data ao retornar para a aba |
| v1.8 | Streak calculado pelas datas reais do banco |
| v1.9 | Validação de data: passado força conclusão, futuro força planejamento |
| v2.0 | Treinos padrão: criação, edição, exclusão e aplicação no formulário |
| v2.1 | Seed automático de 7 treinos padrão na primeira inicialização |
| v2.2 | Histórico com filtros Semana/Mês/Geral e cards colapsáveis |
| v2.3 | Título de nível, tabela de progressão, modais de streak e meta semanal |
| v2.4 | Seção "Treinos desta semana" na tela Início |
| v2.5 | Navegação reestruturada: Stack + 4 abas |
| v2.6 | Paleta de cores: azul para edição/template, cinza para status Planejado |
| v2.7 | Botão `?` com modal explicativo dos modos de registro |
| v2.8 | Correção de layout: badge não conflita com nomes longos no Histórico |

---

Desenvolvido por: **Marcus Aurelius Costa de Paiva**