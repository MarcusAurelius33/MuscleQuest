import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllWorkoutsWithDetails, markWorkoutCompleted, deleteWorkout } from '../database/db';
import useUserStore from '../store/useUserStore';
import AppAlert from '../components/AppAlert';

const XP_PER_WORKOUT = 20;

const FILTERS = ['Semana', 'Mês', 'Geral'];

function getDateRange(filter) {
  const fmt = (d) => d.toISOString().split('T')[0];
  const now = new Date();
  if (filter === 'Semana') {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return [fmt(monday), fmt(sunday)];
  }
  if (filter === 'Mês') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [fmt(start), fmt(end)];
  }
  return [null, null];
}

export default function WorkoutListScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [filter, setFilter] = useState('Geral');
  const [alert, setAlert] = useState(null);
  const { addXp, removeXp } = useUserStore();

  const showAlert = (title, message, buttons) => setAlert({ title, message, buttons });
  const hideAlert = () => setAlert(null);

  const loadWorkouts = useCallback((activeFilter) => {
    const [start, end] = getDateRange(activeFilter);
    setWorkouts(getAllWorkoutsWithDetails(start, end));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts(filter);
    }, [filter, loadWorkouts])
  );

  const handleDelete = (workout) => {
    const wasCompleted = workout.status === 'completed';
    const xpEarned = workout.xpEarned || 0;

    showAlert(
      'Excluir treino',
      wasCompleted
        ? `Excluir "${workout.name}"? Você perderá ${xpEarned} XP.`
        : `Excluir "${workout.name}"? O dia ficará livre para outro treino.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: hideAlert },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            hideAlert();
            const ok = deleteWorkout(workout.id);
            if (ok) {
              if (wasCompleted) removeXp(xpEarned);
              loadWorkouts(filter);
            } else {
              showAlert('Erro', 'Não foi possível excluir o treino.', [
                { text: 'OK', onPress: hideAlert },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleComplete = (workout) => {
    showAlert(
      'Concluir treino',
      `Marcar "${workout.name}" como concluído? Você ganha ${XP_PER_WORKOUT} XP!`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: hideAlert },
        {
          text: 'Concluir',
          onPress: () => {
            hideAlert();
            markWorkoutCompleted(workout.id, XP_PER_WORKOUT);
            addXp(XP_PER_WORKOUT);
            loadWorkouts(filter);
          },
        },
      ]
    );
  };

  return (
    <>
    <AppAlert
      visible={!!alert}
      title={alert?.title}
      message={alert?.message}
      buttons={alert?.buttons ?? []}
    />
    <View style={styles.filterRow}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.filterButton, filter === f && styles.filterButtonActive]}
          onPress={() => { setFilter(f); loadWorkouts(f); }}
        >
          <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {workouts.length === 0 ? (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum treino encontrado.</Text>
        <Text style={styles.emptySubtext}>
          {filter === 'Geral' ? 'Use a aba "Registrar" para começar!' : `Nenhum treino registrado neste ${filter === 'Semana' ? 'semana' : 'mês'}.`}
        </Text>
      </View>
    ) : (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {workouts.map((workout) => (
        <View key={workout.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDate}>{workout.date}</Text>
            </View>
            <View
              style={[
                styles.badge,
                workout.status === 'completed' ? styles.badgeDone : styles.badgePlanned,
              ]}
            >
              <Text style={styles.badgeText}>
                {workout.status === 'completed' ? 'Concluído' : 'Planejado'}
              </Text>
            </View>
          </View>

          {workout.exercises.map((ex) => (
            <View key={ex.id} style={styles.exercise}>
              <Text style={styles.exerciseName}>
                {ex.name}{' '}
                <Text style={styles.muscleGroup}>({ex.muscle_group})</Text>
              </Text>
              {ex.sets.map((s) => (
                <Text key={s.id} style={styles.setRow}>
                  Série {s.set_number}: {s.reps} rep × {s.weight} kg
                </Text>
              ))}
            </View>
          ))}

          <View style={styles.actions}>
            {workout.status === 'planned' && workout.date <= new Date().toISOString().split('T')[0] && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleComplete(workout)}
              >
                <Text style={styles.completeButtonText}>Marcar como concluído</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(workout)}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#222222',
  },
  filterButtonActive: {
    backgroundColor: '#00FF6620',
    borderWidth: 1,
    borderColor: '#00FF6660',
  },
  filterText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#00FF66',
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 16,
    gap: 14,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#888888',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  workoutDate: {
    color: '#888888',
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDone: {
    backgroundColor: '#00FF6620',
  },
  badgePlanned: {
    backgroundColor: '#FF6B0020',
  },
  badgeText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  exercise: {
    borderLeftWidth: 2,
    borderLeftColor: '#333333',
    paddingLeft: 10,
    gap: 2,
  },
  exerciseName: {
    color: '#EEEEEE',
    fontSize: 14,
    fontWeight: '600',
  },
  muscleGroup: {
    color: '#00FF66',
    fontWeight: 'normal',
    fontSize: 13,
  },
  setRow: {
    color: '#999999',
    fontSize: 13,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
  completeButton: {
    backgroundColor: '#00FF66',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#FF444460',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
