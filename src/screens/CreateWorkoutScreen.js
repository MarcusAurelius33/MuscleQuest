import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { insertWorkoutFull } from '../database/db';
import useUserStore from '../store/useUserStore';

const XP_PER_WORKOUT = 20;

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Quadríceps', 'Posterior', 'Glúteo', 'Panturrilha', 'Abdômen',
];

function newExercise() {
  return { name: '', muscle_group: MUSCLE_GROUPS[0], sets: [{ reps: '', weight: '' }] };
}

export default function CreateWorkoutScreen({ navigation }) {
  const [workoutName, setWorkoutName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [exercises, setExercises] = useState([newExercise()]);
  const { addXp, incrementStreak } = useUserStore();

  const updateExercise = (exIndex, field, value) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exIndex] = { ...updated[exIndex], [field]: value };
      return updated;
    });
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIndex].sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      updated[exIndex] = { ...updated[exIndex], sets };
      return updated;
    });
  };

  const addSet = (exIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exIndex] = {
        ...updated[exIndex],
        sets: [...updated[exIndex].sets, { reps: '', weight: '' }],
      };
      return updated;
    });
  };

  const removeSet = (exIndex, setIndex) => {
    setExercises((prev) => {
      const updated = [...prev];
      const sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
      updated[exIndex] = { ...updated[exIndex], sets };
      return updated;
    });
  };

  const addExercise = () => setExercises((prev) => [...prev, newExercise()]);

  const removeExercise = (exIndex) =>
    setExercises((prev) => prev.filter((_, i) => i !== exIndex));

  const handleSave = () => {
    if (!workoutName.trim()) {
      Alert.alert('Atenção', 'Dê um nome ao treino.');
      return;
    }
    for (const ex of exercises) {
      if (!ex.name.trim()) {
        Alert.alert('Atenção', 'Preencha o nome de todos os exercícios.');
        return;
      }
    }

    const status = isCompleted ? 'completed' : 'planned';
    const xpEarned = isCompleted ? XP_PER_WORKOUT : 0;

    const saved = insertWorkoutFull({
      name: workoutName.trim(),
      date,
      status,
      xpEarned,
      exercises,
    });

    if (saved) {
      if (isCompleted) {
        addXp(XP_PER_WORKOUT);
        incrementStreak();
      }
      navigation.navigate('Histórico');
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o treino. Tente novamente.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Nome do treino</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Treino A – Peito e Tríceps"
        placeholderTextColor="#555"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <Text style={styles.sectionTitle}>Data</Text>
      <TextInput
        style={styles.input}
        placeholder="AAAA-MM-DD"
        placeholderTextColor="#555"
        value={date}
        onChangeText={setDate}
      />

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, !isCompleted && styles.toggleActive]}
          onPress={() => setIsCompleted(false)}
        >
          <Text style={[styles.toggleText, !isCompleted && styles.toggleTextActive]}>
            Planejar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isCompleted && styles.toggleActiveGreen]}
          onPress={() => setIsCompleted(true)}
        >
          <Text style={[styles.toggleText, isCompleted && styles.toggleTextActive]}>
            Registrar concluído
          </Text>
        </TouchableOpacity>
      </View>

      {exercises.map((ex, exIndex) => (
        <View key={exIndex} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseLabel}>Exercício {exIndex + 1}</Text>
            {exercises.length > 1 && (
              <TouchableOpacity onPress={() => removeExercise(exIndex)}>
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nome do exercício"
            placeholderTextColor="#555"
            value={ex.name}
            onChangeText={(v) => updateExercise(exIndex, 'name', v)}
          />

          <Text style={styles.label}>Grupo muscular</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleScroll}>
            {MUSCLE_GROUPS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.muscleChip, ex.muscle_group === g && styles.muscleChipActive]}
                onPress={() => updateExercise(exIndex, 'muscle_group', g)}
              >
                <Text style={[styles.muscleChipText, ex.muscle_group === g && styles.muscleChipTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {ex.sets.map((s, setIndex) => (
            <View key={setIndex} style={styles.setRow}>
              <Text style={styles.setLabel}>Série {setIndex + 1}</Text>
              <TextInput
                style={styles.setInput}
                placeholder="Reps"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={s.reps}
                onChangeText={(v) => updateSet(exIndex, setIndex, 'reps', v)}
              />
              <TextInput
                style={styles.setInput}
                placeholder="Kg"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={s.weight}
                onChangeText={(v) => updateSet(exIndex, setIndex, 'weight', v)}
              />
              {ex.sets.length > 1 && (
                <TouchableOpacity onPress={() => removeSet(exIndex, setIndex)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exIndex)}>
            <Text style={styles.addSetText}>+ Adicionar série</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
        <Text style={styles.addExerciseText}>+ Adicionar exercício</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isCompleted ? 'Salvar treino (+20 XP)' : 'Salvar planejamento'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#CCCCCC',
    fontSize: 13,
    marginBottom: -6,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF6B0030',
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  toggleActiveGreen: {
    backgroundColor: '#00FF6630',
    borderWidth: 1,
    borderColor: '#00FF66',
  },
  toggleText: {
    color: '#888888',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  exerciseCard: {
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseLabel: {
    color: '#00FF66',
    fontWeight: 'bold',
    fontSize: 14,
  },
  label: {
    color: '#888888',
    fontSize: 12,
    marginBottom: -4,
  },
  muscleScroll: {
    flexGrow: 0,
  },
  muscleChip: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  muscleChipActive: {
    backgroundColor: '#00FF6630',
    borderWidth: 1,
    borderColor: '#00FF66',
  },
  muscleChipText: {
    color: '#888888',
    fontSize: 13,
  },
  muscleChipTextActive: {
    color: '#00FF66',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setLabel: {
    color: '#999999',
    fontSize: 13,
    width: 52,
  },
  setInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  removeText: {
    color: '#FF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  addSetButton: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  addSetText: {
    color: '#888888',
    fontSize: 13,
  },
  addExerciseButton: {
    borderWidth: 1,
    borderColor: '#00FF6660',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addExerciseText: {
    color: '#00FF66',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#00FF66',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
