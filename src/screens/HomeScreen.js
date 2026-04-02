import { useState, useCallback } from 'react';
import { View, Text, TextInput, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useUserStore from '../store/useUserStore';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { getAllExerciseProgress, getWorkoutsCountBetweenDates, getWorkoutsForWeek, getStreak } from '../database/db';

const LEVEL_TABLE = [
  { min: 1,   max: 3,        title: 'Frango de Granja' },
  { min: 4,   max: 6,        title: 'Chassi de Grilo' },
  { min: 7,   max: 10,       title: 'Projeto Verão' },
  { min: 11,  max: 15,       title: 'Falso Magro' },
  { min: 16,  max: 20,       title: 'Levantador de Celular' },
  { min: 21,  max: 30,       title: 'Rato de Academia Júnior' },
  { min: 31,  max: 40,       title: 'Geladeira Electrolux' },
  { min: 41,  max: 50,       title: 'Guarda-Roupa de Carvalho' },
  { min: 51,  max: 60,       title: 'Mutante em Treinamento' },
  { min: 61,  max: 80,       title: 'Titã de Aço' },
  { min: 81,  max: 99,       title: 'Dono da Academia' },
  { min: 100, max: Infinity, title: 'Herdeiro do Olimpo' },
];

function getLevelTitle(level) {
  if (level <= 3)  return 'Frango de Granja';
  if (level <= 6)  return 'Chassi de Grilo';
  if (level <= 10) return 'Projeto Verão';
  if (level <= 15) return 'Falso Magro';
  if (level <= 20) return 'Levantador de Celular';
  if (level <= 30) return 'Rato de Academia Júnior';
  if (level <= 40) return 'Geladeira Electrolux';
  if (level <= 50) return 'Guarda-Roupa de Carvalho';
  if (level <= 60) return 'Mutante em Treinamento';
  if (level <= 80) return 'Titã de Aço';
  if (level <= 99) return 'Dono da Academia';
  return 'Herdeiro do Olimpo';
}

export default function HomeScreen() {
  const { level, xp, weeklyGoal, setWeeklyGoal } = useUserStore();
  const [progressList, setProgressList] = useState([]);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState([]);
  const [dbStreak, setDbStreak] = useState({ count: 0, startDate: null });
  const [expandedCard, setExpandedCard] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      setProgressList(getAllExerciseProgress());
      setDbStreak(getStreak());

      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const fmt = (d) => d.toISOString().split('T')[0];
      const start = fmt(monday);
      const end = fmt(sunday);
      setWeeklyCount(getWorkoutsCountBetweenDates(start, end));
      setWeeklyWorkouts(getWorkoutsForWeek(start, end));
    }, [])
  );

  const xpNeeded = level * 100;
  const xpProgress = Math.round((xp / xpNeeded) * 100);

  const formatDate = (ymd) => {
    if (!ymd) return '';
    const [year, month, day] = ymd.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSaveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (!goalInput || isNaN(val) || val < 1 || val > 7) return;
    setWeeklyGoal(val);
    setShowGoalModal(false);
    setGoalInput('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>MuscleQuest</Text>

      {/* Level e XP */}
      <TouchableOpacity style={styles.section} onPress={() => setShowLevelsModal(true)} activeOpacity={0.7}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Nível {level}</Text>
            <Text style={styles.levelTitle}>{getLevelTitle(level)}</Text>
          </View>
          <Text style={styles.xpText}>{xp} / {xpNeeded} XP</Text>
        </View>
        <ProgressBar progress={xpProgress} color="#00FF66" />
      </TouchableOpacity>

      {/* Modal tabela de níveis */}
      <Modal transparent animationType="fade" visible={showLevelsModal} statusBarTranslucent>
        <View style={styles.backdrop}>
          <View style={[styles.modalBox, styles.levelsModalBox]}>
            <Text style={styles.modalTitle}>Tabela de Níveis</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LEVEL_TABLE.map((row) => {
                const isCurrent = level >= row.min && level <= row.max;
                return (
                  <View key={row.min} style={[styles.levelRow, isCurrent && styles.levelRowActive]}>
                    <Text style={[styles.levelRange, isCurrent && styles.levelRangeActive]}>
                      {row.max === Infinity ? `${row.min}+` : row.min === row.max ? `${row.min}` : `${row.min}–${row.max}`}
                    </Text>
                    <View style={styles.levelRowDivider} />
                    <Text style={[styles.levelName, isCurrent && styles.levelNameActive]}>{row.title}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowLevelsModal(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modais */}
      <Modal transparent animationType="fade" visible={showStreakModal} statusBarTranslucent>
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sequência atual</Text>
            <Text style={styles.modalBody}>
              {dbStreak.count} {dbStreak.count === 1 ? 'dia' : 'dias'} consecutivos
            </Text>
            <Text style={styles.modalSub}>
              Início em {formatDate(dbStreak.startDate)}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowStreakModal(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={showGoalModal} statusBarTranslucent>
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Meta semanal</Text>
            <Text style={styles.modalSub}>Quantos treinos por semana? (1–7)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              maxLength={1}
              placeholder={String(weeklyGoal)}
              placeholderTextColor="#555"
              value={goalInput}
              onChangeText={(v) => {
                const n = parseInt(v, 10);
                if (v === '' || (n >= 1 && n <= 7)) setGoalInput(v);
              }}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => { setShowGoalModal(false); setGoalInput(''); }}>
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveGoal}>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Streak e Meta */}
      <View style={styles.cards}>
        <StatCard
          title="Sequência"
          value={`${dbStreak.count} ${dbStreak.count === 1 ? 'dia' : 'dias'}`}
          icon={require('../../assets/icons/streak.png')}
          color="#FF6B00"
          onPress={dbStreak.count > 0 ? () => setShowStreakModal(true) : undefined}
        />
        <StatCard
          title="Meta semanal"
          value={`${weeklyCount}/${weeklyGoal}`}
          icon={require('../../assets/icons/meta.png')}
          color="#00BFFF"
          onPress={() => { setGoalInput(String(weeklyGoal)); setShowGoalModal(true); }}
        />
      </View>

      {/* Treinos da semana */}
      <View style={styles.weekSection}>
        <Text style={styles.weekTitle}>Treinos desta semana</Text>
        {weeklyWorkouts.length === 0 ? (
          <View style={styles.weekEmpty}>
            <Text style={styles.weekEmptyText}>Nenhum treino esta semana.</Text>
            <Text style={styles.weekEmptyHint}>Acesse a aba Registrar para planejar sua semana.</Text>
          </View>
        ) : (
          weeklyWorkouts.map((w) => {
            const done = w.status === 'completed';
            return (
              <View key={w.id} style={styles.weekCard}>
                <View style={[styles.weekDot, { backgroundColor: done ? '#00FF66' : '#FF6B00' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.weekWorkoutName}>{w.name}</Text>
                  <Text style={styles.weekWorkoutDate}>{formatDate(w.date)}</Text>
                </View>
                <Text style={[styles.weekBadge, { color: done ? '#00FF66' : '#FF6B00' }]}>
                  {done ? 'Concluído' : 'Planejado'}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Desempenho (variação de carga) */}
      {progressList.length > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressSectionTitle}>Desempenho</Text>
          {progressList.map((item) => {
            const isExpanded = expandedCard === item.exerciseName;
            const accentColor = item.improved ? '#00FF66' : '#FF4444';
            return (
              <TouchableOpacity
                key={item.exerciseName}
                activeOpacity={0.8}
                onPress={() => setExpandedCard(isExpanded ? null : item.exerciseName)}
                style={[styles.progressCard, { borderLeftColor: accentColor }]}
              >
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressTitle, { color: accentColor }]}>
                    {item.improved ? 'Evolução detectada!' : 'Queda de desempenho'}
                  </Text>
                  <Text style={[styles.progressChevron, { color: accentColor }]}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
                <Text style={styles.progressExercise}>{item.exerciseName}</Text>
                <Text style={styles.progressValues}>
                  Anterior: {item.previousWeight} kg {'→'} Recente: {item.recentWeight} kg
                </Text>

                {isExpanded && (
                  <View style={styles.progressDetail}>
                    <View style={styles.progressDetailRow}>
                      <Text style={styles.progressDetailLabel}>Treino anterior</Text>
                      <Text style={styles.progressDetailWorkout}>{item.previousWorkoutName}</Text>
                      <Text style={styles.progressDetailDate}>{item.previousDate}</Text>
                    </View>
                    <View style={[styles.progressDetailDivider, { backgroundColor: accentColor + '40' }]} />
                    <View style={styles.progressDetailRow}>
                      <Text style={styles.progressDetailLabel}>Treino recente</Text>
                      <Text style={styles.progressDetailWorkout}>{item.recentWorkoutName}</Text>
                      <Text style={styles.progressDetailDate}>{item.recentDate}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 32,
  },
  title: {
    color: '#00FF66',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  levelTitle: {
    color: '#00FF66',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  levelsModalBox: {
    maxHeight: '80%',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    gap: 12,
  },
  levelRowActive: {
    backgroundColor: '#00FF6610',
    borderRadius: 8,
    paddingHorizontal: 6,
    marginHorizontal: -6,
  },
  levelRange: {
    color: '#555555',
    fontSize: 12,
    fontWeight: 'bold',
    width: 44,
    textAlign: 'center',
  },
  levelRangeActive: {
    color: '#00FF66',
  },
  levelRowDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#2A2A2A',
  },
  levelName: {
    color: '#AAAAAA',
    fontSize: 13,
    flex: 1,
  },
  levelNameActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  xpText: {
    color: '#00FF66',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cards: {
    gap: 12,
  },
  progressSection: {
    gap: 12,
  },
  progressSectionTitle: {
    color: '#888888',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressCard: {
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressTitle: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  progressChevron: {
    fontSize: 11,
  },
  progressExercise: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressValues: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 2,
  },
  progressDetail: {
    marginTop: 12,
    gap: 8,
  },
  progressDetailRow: {
    gap: 2,
  },
  progressDetailLabel: {
    color: '#666666',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressDetailWorkout: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressDetailDate: {
    color: '#888888',
    fontSize: 12,
  },
  progressDetailDivider: {
    height: 1,
  },
  weekSection: {
    gap: 8,
  },
  weekTitle: {
    color: '#888888',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weekCard: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BFFF',
  },
  weekWorkoutName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  weekWorkoutDate: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  weekBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  weekEmpty: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 16,
    gap: 4,
  },
  weekEmptyText: {
    color: '#666666',
    fontSize: 14,
  },
  weekEmptyHint: {
    color: '#888888',
    fontSize: 13,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  modalTitle: {
    color: '#00FF66',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSub: {
    color: '#888888',
    fontSize: 14,
  },
  modalInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#00FF66',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: '#AAAAAA',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
