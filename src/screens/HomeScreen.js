import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useUserStore from '../store/useUserStore';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { getAllExerciseProgress, getWorkoutsCountBetweenDates } from '../database/db';

export default function HomeScreen() {
  const { level, xp, streak, weeklyGoal } = useUserStore();
  const [progressList, setProgressList] = useState([]);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setProgressList(getAllExerciseProgress());

      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const fmt = (d) => d.toISOString().split('T')[0];
      setWeeklyCount(getWorkoutsCountBetweenDates(fmt(monday), fmt(sunday)));
    }, [])
  );

  const xpNeeded = level * 100;
  const xpProgress = Math.round((xp / xpNeeded) * 100);
  const weeklyProgress = Math.round((weeklyCount / weeklyGoal) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>MuscleQuest</Text>

      {/* Level e XP */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Nível {level}</Text>
          <Text style={styles.xpText}>{xp} / {xpNeeded} XP</Text>
        </View>
        <ProgressBar progress={xpProgress} color="#00FF66" />
      </View>

      {/* Streak e Meta */}
      <View style={styles.cards}>
        <StatCard title="Sequência" value={`${streak} dias`} icon="🔥" color="#FF6B00" />
        <StatCard title="Meta semanal" value={`${weeklyCount}/${weeklyGoal}`} icon="🎯" color="#00BFFF" />
      </View>

      {/* Progresso da meta */}
      <View style={styles.section}>
        <Text style={styles.label}>Progresso da semana</Text>
        <ProgressBar progress={weeklyProgress} color="#00BFFF" />
      </View>

      {/* Cards de variação por exercício */}
      {progressList.length > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressSectionTitle}>Variação de carga</Text>
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
});
