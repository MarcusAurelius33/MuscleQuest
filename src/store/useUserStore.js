import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  level: 1,
  xp: 0,
  weeklyGoal: 4,

  setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),

  addXp: (amount) => {
    const { level, xp } = get();
    const xpNeeded = level * 100;
    const newXp = xp + amount;

    if (newXp >= xpNeeded) {
      set({ level: level + 1, xp: newXp - xpNeeded });
    } else {
      set({ xp: newXp });
    }
  },

  removeXp: (amount) => {
    const { level, xp } = get();
    let newXp = xp - amount;
    let newLevel = level;

    // Se o XP ficar negativo, desce de nível até estabilizar
    while (newXp < 0 && newLevel > 1) {
      newLevel -= 1;
      newXp = newLevel * 100 + newXp; // xp do nível anterior + saldo negativo
    }

    set({ level: newLevel, xp: Math.max(0, newXp) });
  },
}));

export default useUserStore;
