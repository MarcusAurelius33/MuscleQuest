import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppAlert from '../components/AppAlert';
import { getAllTemplates, deleteTemplate } from '../database/db';

export default function TemplatesScreen({ navigation }) {
  const [templates, setTemplates] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (title, message, buttons) => setAlert({ title, message, buttons });
  const hideAlert = () => setAlert(null);

  useFocusEffect(
    useCallback(() => {
      setTemplates(getAllTemplates());
    }, [])
  );

  const handleDelete = (t) => {
    showAlert(
      'Excluir treino padrão',
      `Excluir "${t.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: hideAlert },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            hideAlert();
            deleteTemplate(t.id);
            setTemplates(getAllTemplates());
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CriarTemplate')}
      >
        <Text style={styles.createButtonText}>+ Criar treino padrão</Text>
      </TouchableOpacity>

      {templates.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum treino padrão criado ainda.</Text>
          <Text style={styles.emptyHint}>Crie um para reutilizá-lo ao registrar treinos.</Text>
        </View>
      ) : (
        templates.map((t) => {
          const isExpanded = expanded === t.id;
          return (
            <View key={t.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setExpanded(isExpanded ? null : t.id)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.cardName}>{t.name}</Text>
                  <Text style={styles.cardSub}>
                    {t.exercises.length} {t.exercises.length === 1 ? 'exercício' : 'exercícios'}
                  </Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.cardDetail}>
                  {t.exercises.map((ex) => (
                    <View key={ex.id} style={styles.exerciseRow}>
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
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate('CriarTemplate', { template: t })}
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(t)}
                    >
                      <Text style={styles.deleteButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  createButton: {
    backgroundColor: '#00FF66',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  createButtonText: { color: '#1A1A1A', fontWeight: 'bold', fontSize: 15 },
  empty: {
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: { color: '#666666', fontSize: 15 },
  emptyHint: { color: '#444444', fontSize: 13 },
  card: { backgroundColor: '#222222', borderRadius: 10, overflow: 'hidden' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  cardName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#888888', fontSize: 13, marginTop: 2 },
  chevron: { color: '#00FF66', fontSize: 12 },
  cardDetail: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    padding: 14,
    gap: 10,
  },
  exerciseRow: {
    borderLeftWidth: 2,
    borderLeftColor: '#333333',
    paddingLeft: 10,
    gap: 2,
  },
  exerciseName: { color: '#EEEEEE', fontSize: 14, fontWeight: '600' },
  muscleGroup: { color: '#00FF66', fontWeight: 'normal', fontSize: 13 },
  setRow: { color: '#999999', fontSize: 13 },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#00BFFF20',
    borderWidth: 1,
    borderColor: '#00BFFF60',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  editButtonText: { color: '#00BFFF', fontSize: 13, fontWeight: 'bold' },
  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FF444460',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#FF4444', fontSize: 13, fontWeight: 'bold' },
});
