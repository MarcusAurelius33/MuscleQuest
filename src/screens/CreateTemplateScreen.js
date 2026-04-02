import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppAlert from '../components/AppAlert';
import { insertTemplate } from '../database/db';

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Quadríceps', 'Posterior', 'Glúteo', 'Panturrilha', 'Abdômen',
];

const newExercise = () => ({
  name: '',
  muscle_group: MUSCLE_GROUPS[0],
  sets: [{ reps: '', weight: '' }],
});

export default function CreateTemplateScreen({ navigation }) {
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState([newExercise()]);
  const [alert, setAlert] = useState(null);

  const showAlert = (title, message) =>
    setAlert({ title, message, buttons: [{ text: 'OK', onPress: () => setAlert(null) }] });

  useFocusEffect(
    useCallback(() => {
      setTemplateName('');
      setExercises([newExercise()]);
    }, [])
  );

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
      updated[exIndex] = {
        ...updated[exIndex],
        sets: updated[exIndex].sets.filter((_, i) => i !== setIndex),
      };
      return updated;
    });
  };

  const addExercise = () => setExercises((prev) => [...prev, newExercise()]);
  const removeExercise = (i) => setExercises((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!templateName.trim()) {
      showAlert('Atenção', 'Dê um nome ao treino padrão.');
      return;
    }
    for (const ex of exercises) {
      if (!ex.name.trim()) {
        showAlert('Atenção', 'Preencha o nome de todos os exercícios.');
        return;
      }
      for (const s of ex.sets) {
        if (s.reps === '' || s.weight === '') {
          showAlert('Atenção', 'Preencha os campos de repetição e carga de todas as séries.');
          return;
        }
        if (Number(s.reps) === 0) {
          showAlert('Atenção', 'O número de repetições para uma série não pode ser 0.');
          return;
        }
      }
    }
    const ok = insertTemplate({ name: templateName.trim(), exercises });
    if (ok) {
      navigation.goBack();
    } else {
      showAlert('Erro', 'Não foi possível salvar o treino padrão.');
    }
  };

  return (
    <>
    <AppAlert
      visible={!!alert}
      title={alert?.title}
      message={alert?.message}
      buttons={alert?.buttons ?? []}
    />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Nome do treino padrão</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Treino A – Peito e Tríceps"
        placeholderTextColor="#555"
        value={templateName}
        onChangeText={setTemplateName}
      />

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
            onChangeText={(v) =>
              setExercises((prev) => {
                const u = [...prev];
                u[exIndex] = { ...u[exIndex], name: v };
                return u;
              })
            }
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleScroll}>
            {MUSCLE_GROUPS.map((mg) => (
              <TouchableOpacity
                key={mg}
                style={[styles.muscleChip, ex.muscle_group === mg && styles.muscleChipActive]}
                onPress={() =>
                  setExercises((prev) => {
                    const u = [...prev];
                    u[exIndex] = { ...u[exIndex], muscle_group: mg };
                    return u;
                  })
                }
              >
                <Text style={[styles.muscleChipText, ex.muscle_group === mg && styles.muscleChipTextActive]}>
                  {mg}
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
        <Text style={styles.saveButtonText}>Salvar treino padrão</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  sectionTitle: { color: '#888888', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#222222', borderRadius: 8, padding: 12, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2A2A2A' },
  exerciseCard: { backgroundColor: '#222222', borderRadius: 10, padding: 14, gap: 10 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseLabel: { color: '#00FF66', fontWeight: 'bold', fontSize: 14 },
  removeText: { color: '#FF4444', fontSize: 13 },
  muscleScroll: { marginVertical: 4 },
  muscleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#2A2A2A', marginRight: 8 },
  muscleChipActive: { backgroundColor: '#00FF6620', borderWidth: 1, borderColor: '#00FF6660' },
  muscleChipText: { color: '#666666', fontSize: 13 },
  muscleChipTextActive: { color: '#00FF66', fontWeight: 'bold' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setLabel: { color: '#888888', fontSize: 13, width: 52 },
  setInput: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 6, padding: 8, color: '#FFFFFF', fontSize: 14, textAlign: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  addSetButton: { alignItems: 'center', paddingVertical: 6 },
  addSetText: { color: '#00FF66', fontSize: 13 },
  addExerciseButton: { borderWidth: 1, borderColor: '#00FF6640', borderRadius: 10, padding: 14, alignItems: 'center' },
  addExerciseText: { color: '#00FF66', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#00FF66', borderRadius: 10, padding: 16, alignItems: 'center' },
  saveButtonText: { color: '#1A1A1A', fontWeight: 'bold', fontSize: 16 },
});
