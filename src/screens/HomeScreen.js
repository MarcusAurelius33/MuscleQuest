import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useUserStore from '../store/useUserStore';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { getTopExerciseProgress, getWorkoutsCountBetweenDates } from '../database/db';

export default function HomeScreen() {
  const { level, xp, streak, weeklyGoal } = useUserStore();
  const [progressData, setProgressData] = React.useState(null);
  const [weeklyCount, setWeeklyCount] = React.useState(0);

  useFocusEffect(
    useCallback(() => {
      const progress = getTopExerciseProgress();
      setProgressData(progress);

      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const fmt = (d) => d.toISOString().split('T')[0];
      const count = getWorkoutsCountBetweenDates(fmt(monday), fmt(sunday));
      setWeeklyCount(count);
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
        <StatCard
          title="Sequência"
          value={`${streak} dias`}
          icon="🔥"
          color="#FF6B00"
        />
        <StatCard
          title="Meta semanal"
          value={`${weeklyCount}/${weeklyGoal}`}
          icon="🎯"
          color="#00BFFF"
        />
      </View>

      {/* Progresso da meta */}
      <View style={styles.section}>
        <Text style={styles.label}>Progresso da semana</Text>
        <ProgressBar progress={weeklyProgress} color="#00BFFF" />
      </View>

      {/* Variação de carga */}
      {progressData && (
        <View style={[styles.progressCard, { borderLeftColor: progressData.improved ? '#00FF66' : '#FF6B00' }]}>
          <Text style={[styles.progressTitle, { color: progressData.improved ? '#00FF66' : '#FF6B00' }]}>
            {progressData.improved ? 'Evolução detectada!' : 'Queda de desempenho'}
          </Text>
          <Text style={styles.progressExercise}>{progressData.exerciseName}</Text>
          <Text style={styles.progressValues}>
            Máx. anterior: {progressData.previousMax} kg {'→'} Recente: {progressData.recentWeight} kg
          </Text>
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
  progressCard: {
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00FF66',
  },
  progressTitle: {
    color: '#00FF66',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
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
});
