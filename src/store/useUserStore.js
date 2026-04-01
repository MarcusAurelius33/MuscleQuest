import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  level: 1,
  xp: 0,
  streak: 0,
  weeklyGoal: 4,

  setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

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
}));

export default useUserStore;
