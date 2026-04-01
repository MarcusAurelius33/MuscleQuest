import * as SQLite from 'expo-sqlite';

let db = null;

export const initDb = () => {
  try {
    db = SQLite.openDatabaseSync('musclequest.db');

    db.execSync(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'planned',
        xpEarned INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER,
        muscle_group TEXT NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER,
        set_number INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight REAL NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );
    `);
    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
};

export const getDb = () => db;

export const insertWorkoutFull = (workoutData) => {
  try {
    const stm = db.prepareSync(
      'INSERT INTO workouts (name, date, status, xpEarned) VALUES (?, ?, ?, ?)'
    );
    const result = stm.executeSync([
      workoutData.name,
      workoutData.date,
      workoutData.status,
      workoutData.xpEarned || 0,
    ]);
    const workoutId = result.lastInsertRowId;
    stm.finalizeSync();

    for (const ex of workoutData.exercises) {
      const stmEx = db.prepareSync(
        'INSERT INTO exercises (workout_id, muscle_group, name) VALUES (?, ?, ?)'
      );
      const resEx = stmEx.executeSync([workoutId, ex.muscle_group, ex.name]);
      const exerciseId = resEx.lastInsertRowId;
      stmEx.finalizeSync();

      let setNumber = 1;
      for (const s of ex.sets) {
        const stmSet = db.prepareSync(
          'INSERT INTO sets (exercise_id, set_number, reps, weight) VALUES (?, ?, ?, ?)'
        );
        stmSet.executeSync([exerciseId, setNumber++, parseInt(s.reps, 10), parseFloat(s.weight)]);
        stmSet.finalizeSync();
      }
    }
    return true;
  } catch (e) {
    console.error('Erro ao salvar treino:', e);
    return false;
  }
};

export const getAllWorkoutsWithDetails = () => {
  if (!db) return [];
  const workouts = db.getAllSync('SELECT * FROM workouts ORDER BY id DESC');
  for (const w of workouts) {
    w.exercises = db.getAllSync('SELECT * FROM exercises WHERE workout_id = ?', [w.id]);
    for (const ex of w.exercises) {
      ex.sets = db.getAllSync('SELECT * FROM sets WHERE exercise_id = ?', [ex.id]);
    }
  }
  return workouts;
};

export const markWorkoutCompleted = (id, xp) => {
  const stm = db.prepareSync(
    "UPDATE workouts SET status = 'completed', xpEarned = ? WHERE id = ?"
  );
  stm.executeSync([xp, id]);
  stm.finalizeSync();
};

export const deleteWorkout = (id) => {
  try {
    // Busca os exercícios para poder apagar as séries manualmente
    // (SQLite não ativa CASCADE por padrão)
    const exercises = db.getAllSync('SELECT id FROM exercises WHERE workout_id = ?', [id]);
    for (const ex of exercises) {
      db.runSync('DELETE FROM sets WHERE exercise_id = ?', [ex.id]);
    }
    db.runSync('DELETE FROM exercises WHERE workout_id = ?', [id]);
    db.runSync('DELETE FROM workouts WHERE id = ?', [id]);
    return true;
  } catch (e) {
    console.error('Erro ao excluir treino:', e);
    return false;
  }
};

export const getWorkoutCountForDate = (date) => {
  if (!db) return 0;
  const result = db.getFirstSync(
    'SELECT COUNT(*) as count FROM workouts WHERE date = ?',
    [date]
  );
  return result ? result.count : 0;
};

export const getWorkoutsCountBetweenDates = (startDate, endDate) => {
  if (!db) return 0;
  const result = db.getFirstSync(
    "SELECT COUNT(*) as count FROM workouts WHERE status = 'completed' AND date >= ? AND date <= ?",
    [startDate, endDate]
  );
  return result ? result.count : 0;
};

export const getAllExerciseProgress = () => {
  if (!db) return [];

  // Agrupa por exercício + ID do treino (não por data) para tratar cada treino
  // como sessão independente, mesmo que dois treinos caiam no mesmo dia
  const history = db.getAllSync(`
    SELECT e.name, w.id as workout_id, w.date, MAX(s.weight) as max_weight
    FROM sets s
    JOIN exercises e ON s.exercise_id = e.id
    JOIN workouts w ON e.workout_id = w.id
    WHERE w.status = 'completed'
    GROUP BY e.name, w.id
    ORDER BY e.name, w.date DESC, w.id DESC
  `);

  const map = {};
  for (const record of history) {
    if (!map[record.name]) map[record.name] = [];
    map[record.name].push(record);
  }

  const results = [];
  for (const [exerciseName, records] of Object.entries(map)) {
    if (records.length < 2) continue;

    const recentWeight = records[0].max_weight;
    const previousWeight = records[1].max_weight; // sessão imediatamente anterior

    if (recentWeight !== previousWeight) {
      results.push({
        exerciseName,
        previousWeight,
        recentWeight,
        date: records[0].date,
        improved: recentWeight > previousWeight,
      });
    }
  }
  return results;
};
