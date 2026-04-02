import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import AppAlert from '../components/AppAlert';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { insertWorkoutFull, getWorkoutCountForDate, getAllTemplates } from '../database/db';
import useUserStore from '../store/useUserStore';

const XP_PER_WORKOUT = 20;

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Quadríceps', 'Posterior', 'Glúteo', 'Panturrilha', 'Abdômen',
];

function newExercise() {
  return { name: '', muscle_group: MUSCLE_GROUPS[0], sets: [{ reps: '', weight: '' }] };
}

function toStorageDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function toDisplayDate(date) {
  return date.toLocaleDateString('pt-BR'); // DD/MM/YYYY
}

// 'past' | 'today' | 'future'
function getDateCategory(date) {
  const today = toStorageDate(new Date());
  const d = toStorageDate(date);
  if (d < today) return 'past';
  if (d > today) return 'future';
  return 'today';
}

export default function CreateWorkoutScreen({ navigation }) {
  const [workoutName, setWorkoutName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateBlocked, setDateBlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [exercises, setExercises] = useState([newExercise()]);
  const [alert, setAlert] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);

  const showAlert = (title, message) =>
    setAlert({ title, message, buttons: [{ text: 'OK', onPress: () => setAlert(null) }] });
  const { addXp } = useUserStore();

  // Reseta o formulário e reverifica o bloqueio de data toda vez que a aba recebe foco
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      setWorkoutName('');
      setDate(today);
      setShowDatePicker(false);
      setIsCompleted(false);
      setExercises([newExercise()]);
      setDateBlocked(getWorkoutCountForDate(toStorageDate(today)) > 0);
      setTemplates(getAllTemplates());
    }, [])
  );

  const applyTemplate = (t) => {
    setWorkoutName(t.name);
    setExercises(
      t.exercises.map((ex) => ({
        name: ex.name,
        muscle_group: ex.muscle_group,
        sets: ex.sets.map((s) => ({ reps: String(s.reps), weight: String(s.weight) })),
      }))
    );
    setShowTemplates(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;

    setDate(selectedDate);

    const storageDate = toStorageDate(selectedDate);
    const count = getWorkoutCountForDate(storageDate);
    setDateBlocked(count > 0);

    // Força o modo correto conforme a data escolhida
    const category = getDateCategory(selectedDate);
    if (category === 'past') setIsCompleted(true);
    if (category === 'future') setIsCompleted(false);
  };

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
      showAlert('Atenção', 'Dê um nome ao treino.');
      return;
    }
    for (const ex of exercises) {
      if (!ex.name.trim()) {
        showAlert('Atenção', 'Preencha o nome de todos os exercícios.');
        return;
      }
      for (const s of ex.sets) {
        const reps = Number(s.reps);
        const weight = s.weight;
        if (s.reps === '' || weight === '') {
          showAlert('Atenção', 'Preencha os campos de repetição e carga de todas as séries.');
          return;
        }
        if (reps === 0) {
          showAlert('Atenção', 'O número de repetições para uma série não pode ser 0.');
          return;
        }
      }
    }
    if (dateBlocked) {
      showAlert('Dia ocupado', 'Já existe um treino registrado nessa data. Escolha outro dia.');
      return;
    }

    const status = isCompleted ? 'completed' : 'planned';
    const xpEarned = isCompleted ? XP_PER_WORKOUT : 0;

    const saved = insertWorkoutFull({
      name: workoutName.trim(),
      date: toStorageDate(date),
      status,
      xpEarned,
      exercises,
    });

    if (saved) {
      if (isCompleted) {
        addXp(XP_PER_WORKOUT);
      }
      navigation.navigate('Histórico');
    } else {
      showAlert('Erro', 'Não foi possível salvar o treino. Tente novamente.');
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
    {/* Modal de seleção de treino padrão */}
    <Modal transparent animationType="slide" visible={showTemplates} statusBarTranslucent>
      <View style={styles.templateBackdrop}>
        <View style={styles.templateSheet}>
          <Text style={styles.templateSheetTitle}>Treinos padrão</Text>
          {templates.length === 0 ? (
            <Text style={styles.templateEmpty}>Nenhum treino padrão criado ainda.</Text>
          ) : (
            <ScrollView style={styles.templateList}>
              {templates.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.templateItem}
                  onPress={() => applyTemplate(t)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.templateItemName}>{t.name}</Text>
                  <Text style={styles.templateItemSub}>
                    {t.exercises.length} {t.exercises.length === 1 ? 'exercício' : 'exercícios'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.templateCancelBtn} onPress={() => setShowTemplates(false)}>
            <Text style={styles.templateCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1A1A1A' }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? 110 : 0}
    >
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {templates.length > 0 ? (
        <TouchableOpacity style={styles.useTemplateBtn} onPress={() => setShowTemplates(true)}>
          <Text style={styles.useTemplateBtnText}>Usar treino padrão</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.noTemplateHint}>
          <Text style={styles.noTemplateHintText}>Crie treinos padrão na aba Criar e registre seus treinos com mais agilidade.</Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>Nome do treino</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Treino A – Peito e Tríceps"
        placeholderTextColor="#555"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      {/* Seletor de data — abre o calendário nativo do Android */}
      <Text style={styles.sectionTitle}>Data</Text>
      <TouchableOpacity
        style={[styles.dateButton, dateBlocked && styles.dateButtonBlocked]}
        onPress={() => setShowDatePicker(true)}
      >
        <Image source={require('../../assets/icons/calendario.png')} style={styles.dateButtonIcon} />
        <Text style={[styles.dateButtonText, dateBlocked && styles.dateButtonTextBlocked]}>
          {toDisplayDate(date)}
        </Text>
        {dateBlocked && (
          <Text style={styles.dateBlockedBadge}>Dia ocupado</Text>
        )}
      </TouchableOpacity>

      {dateBlocked && (
        <Text style={styles.dateBlockedHint}>
          Já há um treino registrado nessa data. Escolha outro dia para continuar.
        </Text>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      )}

      {(() => {
        const category = getDateCategory(date);
        const canPlan = category !== 'past';
        const canComplete = category !== 'future';
        return (
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isCompleted && styles.toggleActive,
                !canPlan && styles.toggleDisabled,
              ]}
              onPress={() => canPlan && setIsCompleted(false)}
              disabled={!canPlan}
            >
              <Text style={[styles.toggleText, !isCompleted && styles.toggleTextActive, !canPlan && styles.toggleTextDisabled]}>
                Planejar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isCompleted && styles.toggleActiveGreen,
                !canComplete && styles.toggleDisabled,
              ]}
              onPress={() => canComplete && setIsCompleted(true)}
              disabled={!canComplete}
            >
              <Text style={[styles.toggleText, isCompleted && styles.toggleTextActive, !canComplete && styles.toggleTextDisabled]}>
                Registrar concluído
              </Text>
            </TouchableOpacity>
          </View>
        );
      })()}

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

      <TouchableOpacity
        style={[styles.saveButton, dateBlocked && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={dateBlocked}
      >
        <Text style={styles.saveButtonText}>
          {isCompleted ? 'Salvar treino (+20 XP)' : 'Salvar planejamento'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  noTemplateHint: {
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#00FF6640',
  },
  noTemplateHintText: {
    color: '#666666',
    fontSize: 13,
    lineHeight: 20,
  },
  useTemplateBtn: {
    borderWidth: 1,
    borderColor: '#00BFFF60',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  useTemplateBtnText: {
    color: '#00BFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  templateBackdrop: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'flex-end',
  },
  templateSheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
    gap: 12,
  },
  templateSheetTitle: {
    color: '#00FF66',
    fontSize: 17,
    fontWeight: 'bold',
  },
  templateEmpty: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  templateList: {
    flexGrow: 0,
  },
  templateItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  templateItemName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  templateItemSub: {
    color: '#888888',
    fontSize: 13,
    marginTop: 2,
  },
  templateCancelBtn: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  templateCancelText: {
    color: '#AAAAAA',
    fontWeight: 'bold',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 120,
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
  dateButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButtonBlocked: {
    borderWidth: 1,
    borderColor: '#FF4444',
    backgroundColor: '#FF444415',
  },
  dateButtonIcon: {
    width: 22,
    height: 22,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    flex: 1,
  },
  dateButtonTextBlocked: {
    color: '#FF6666',
  },
  dateBlockedBadge: {
    backgroundColor: '#FF444430',
    color: '#FF6666',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dateBlockedHint: {
    color: '#FF6666',
    fontSize: 12,
    marginTop: -6,
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
  toggleDisabled: {
    opacity: 0.35,
  },
  toggleText: {
    color: '#888888',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextDisabled: {
    color: '#555555',
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
  saveButtonDisabled: {
    backgroundColor: '#333333',
  },
  saveButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
