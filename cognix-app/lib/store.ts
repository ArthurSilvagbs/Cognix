"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";

export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "study" | "review" | "practice" | "project";
export type TaskStatus = "pending" | "in_progress" | "done";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  emoji: string;
  createdAt: string;
}

export interface Task {
  id: string;
  groupId: string | null;
  title: string;
  subject: string;
  priority: TaskPriority;
  type: TaskType;
  status: TaskStatus;
  dueDate?: string;
  estimatedMin: number;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Session {
  id: string;
  groupId: string | null;
  subject: string;
  durationMin: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  groupId: string | null;
  title: string;
  language: string;
  difficulty: Difficulty;
  topicTags: string[];
  description: string;
  starterCode?: string;
  userCode?: string;
  status: "pending" | "done";
  isStarred: boolean;
  feedback?: string;
  createdAt: string;
}

export interface CodeTraining {
  id: string;
  groupId: string | null;
  language: string;
  difficulty: Difficulty;
  topic?: string;
  originalCode: string;
  userCode?: string;
  score?: number;
  feedback?: string;
  memorizeSec: number;
  createdAt: string;
}

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { key: "first_task",  name: "Primeira Tarefa",  description: "Complete sua primeira tarefa",     icon: "🎯", xpReward: 10  },
  { key: "first_code",  name: "Primeiro Código",  description: "Complete seu primeiro exercício",  icon: "💻", xpReward: 20  },
  { key: "5_sessions",  name: "5 Sessões",         description: "Registre 5 sessões de estudo",     icon: "📚", xpReward: 30  },
  { key: "10_tasks",    name: "10 Tarefas Feitas", description: "Complete 10 tarefas",              icon: "🔥", xpReward: 50  },
  { key: "5_exercises", name: "5 Exercícios",      description: "Complete 5 exercícios",            icon: "⚡", xpReward: 40  },
  { key: "level_5",     name: "Nível 5",           description: "Alcance o nível 5",               icon: "🏆", xpReward: 100 },
  { key: "10h_studied", name: "10h Estudadas",     description: "Estude 10 horas no total",        icon: "⏱️", xpReward: 60  },
  { key: "level_10",    name: "Nível 10",          description: "Alcance o nível 10",              icon: "🌟", xpReward: 200 },
  { key: "3_groups",    name: "3 Áreas",           description: "Crie 3 grupos de estudo",         icon: "🗂️", xpReward: 25  },
];

export const GROUP_COLORS = [
  { value: "#7c3aed", label: "Violeta"  },
  { value: "#2563eb", label: "Azul"     },
  { value: "#059669", label: "Verde"    },
  { value: "#d97706", label: "Laranja"  },
  { value: "#db2777", label: "Rosa"     },
  { value: "#0891b2", label: "Ciano"   },
  { value: "#dc2626", label: "Vermelho" },
  { value: "#4f46e5", label: "Índigo"  },
  { value: "#0d9488", label: "Teal"    },
  { value: "#65a30d", label: "Lima"    },
];

export const GROUP_EMOJIS = ["📚","💻","🎯","🏆","📐","🔬","🌍","✍️","🎵","💡","🧠","🚀","📝","🔭","⚗️","🎨"];

interface AppState {
  // Groups
  groups: StudyGroup[];
  activeGroupId: string | null; // null = "Visão Geral" (all groups)

  // Data
  tasks: Task[];
  sessions: Session[];
  exercises: Exercise[];
  trainings: CodeTraining[];

  // User
  user: { name: string; xp: number; level: number };
  unlockedAchievements: string[];

  // Group actions
  addGroup: (group: Omit<StudyGroup, "id" | "createdAt">) => void;
  updateGroup: (id: string, updates: Partial<Omit<StudyGroup, "id" | "createdAt">>) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string | null) => void;

  // Task actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Session actions
  addSession: (session: Omit<Session, "id" | "createdAt">) => void;
  deleteSession: (id: string) => void;

  // Exercise actions
  addExercise: (exercise: Omit<Exercise, "id" | "createdAt">) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;

  // Training actions
  addTraining: (training: Omit<CodeTraining, "id" | "createdAt">) => void;

  // XP
  addXP: (amount: number) => void;
  checkAchievements: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      groups: [],
      activeGroupId: null,
      tasks: [],
      sessions: [],
      exercises: [],
      trainings: [],
      user: { name: "Estudante", xp: 0, level: 1 },
      unlockedAchievements: [],

      // ── Groups ──────────────────────────────────────────────────────────
      addGroup: (group) => {
        set((s) => ({
          groups: [...s.groups, { ...group, id: generateId(), createdAt: new Date().toISOString() }],
        }));
        get().checkAchievements();
      },

      updateGroup: (id, updates) =>
        set((s) => ({ groups: s.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),

      deleteGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          // Orphan content — set groupId to null
          tasks: s.tasks.map((t) => t.groupId === id ? { ...t, groupId: null } : t),
          sessions: s.sessions.map((s2) => s2.groupId === id ? { ...s2, groupId: null } : s2),
          exercises: s.exercises.map((e) => e.groupId === id ? { ...e, groupId: null } : e),
          trainings: s.trainings.map((t) => t.groupId === id ? { ...t, groupId: null } : t),
          activeGroupId: s.activeGroupId === id ? null : s.activeGroupId,
        })),

      setActiveGroup: (id) => set({ activeGroupId: id }),

      // ── Tasks ────────────────────────────────────────────────────────────
      addTask: (task) => {
        set((s) => ({
          tasks: [{ ...task, id: generateId(), createdAt: new Date().toISOString() }, ...s.tasks],
        }));
        get().addXP(5);
        get().checkAchievements();
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const updated = { ...t, ...updates };
            if (updates.status === "done" && t.status !== "done") {
              updated.completedAt = new Date().toISOString();
              get().addXP(10);
            }
            return updated;
          }),
        }));
        get().checkAchievements();
      },

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ── Sessions ─────────────────────────────────────────────────────────
      addSession: (session) => {
        set((s) => ({
          sessions: [{ ...session, id: generateId(), createdAt: new Date().toISOString() }, ...s.sessions],
        }));
        get().addXP(Math.max(Math.floor(session.durationMin / 30) * 5, 5));
        get().checkAchievements();
      },

      deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter((s2) => s2.id !== id) })),

      // ── Exercises ────────────────────────────────────────────────────────
      addExercise: (exercise) => {
        set((s) => ({
          exercises: [{ ...exercise, id: generateId(), createdAt: new Date().toISOString() }, ...s.exercises],
        }));
        get().addXP(20);
        get().checkAchievements();
      },

      updateExercise: (id, updates) =>
        set((s) => ({ exercises: s.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)) })),

      // ── Trainings ────────────────────────────────────────────────────────
      addTraining: (training) => {
        set((s) => ({
          trainings: [{ ...training, id: generateId(), createdAt: new Date().toISOString() }, ...s.trainings],
        }));
        get().addXP(15);
      },

      // ── XP / Achievements ────────────────────────────────────────────────
      addXP: (amount) =>
        set((s) => {
          const newXP = s.user.xp + amount;
          return { user: { ...s.user, xp: newXP, level: Math.floor(newXP / 100) + 1 } };
        }),

      checkAchievements: () => {
        const { tasks, sessions, exercises, groups, user, unlockedAchievements } = get();
        const toUnlock: string[] = [];
        const done = (arr: { status: string }[]) => arr.filter((x) => x.status === "done").length;
        const totalMin = sessions.reduce((a, s) => a + s.durationMin, 0);

        const check = (key: string, cond: boolean) => {
          if (cond && !unlockedAchievements.includes(key)) toUnlock.push(key);
        };
        check("first_task",  done(tasks) >= 1);
        check("first_code",  done(exercises) >= 1);
        check("5_sessions",  sessions.length >= 5);
        check("10_tasks",    done(tasks) >= 10);
        check("5_exercises", done(exercises) >= 5);
        check("level_5",     user.level >= 5);
        check("10h_studied", totalMin >= 600);
        check("level_10",    user.level >= 10);
        check("3_groups",    groups.length >= 3);

        if (toUnlock.length > 0) {
          const xp = toUnlock.reduce((a, k) => a + (ACHIEVEMENTS.find((x) => x.key === k)?.xpReward ?? 0), 0);
          set((s) => ({ unlockedAchievements: [...s.unlockedAchievements, ...toUnlock] }));
          if (xp > 0) get().addXP(xp);
        }
      },
    }),
    { name: "cognix-store" }
  )
);

// ── Filtered selectors ────────────────────────────────────────────────────────
// Call these in components to get data scoped to the active group.
export function useGroupData() {
  const { tasks, sessions, exercises, trainings, activeGroupId } = useStore();
  const filter = <T extends { groupId: string | null }>(arr: T[]) =>
    activeGroupId === null ? arr : arr.filter((x) => x.groupId === activeGroupId);
  return {
    tasks: filter(tasks),
    sessions: filter(sessions),
    exercises: filter(exercises),
    trainings: filter(trainings),
    activeGroupId,
  };
}
