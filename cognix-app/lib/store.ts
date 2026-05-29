"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";
import * as db from "./supabase/db";

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
  // Sync state
  userId: string | null;
  initialized: boolean;

  // Groups
  groups: StudyGroup[];
  activeGroupId: string | null;

  // Data
  tasks: Task[];
  sessions: Session[];
  exercises: Exercise[];
  trainings: CodeTraining[];

  // User
  user: { name: string; xp: number; level: number };
  unlockedAchievements: string[];

  // Sync actions
  setUserId: (id: string | null) => void;
  hydrateFromSupabase: (data: {
    groups: StudyGroup[];
    tasks: Task[];
    sessions: Session[];
    exercises: Exercise[];
    profile: { name: string; xp: number; level: number; unlockedAchievements: string[] } | null;
  }) => void;
  clearStore: () => void;

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
      userId: null,
      initialized: false,
      groups: [],
      activeGroupId: null,
      tasks: [],
      sessions: [],
      exercises: [],
      trainings: [],
      user: { name: "Estudante", xp: 0, level: 1 },
      unlockedAchievements: [],

      // ── Sync ────────────────────────────────────────────────────────────────
      setUserId: (id) => set({ userId: id }),

      hydrateFromSupabase: ({ groups, tasks, sessions, exercises, profile }) => {
        set({
          initialized: true,
          groups,
          tasks,
          sessions,
          exercises,
          user: profile
            ? { name: profile.name, xp: profile.xp, level: profile.level }
            : { name: "Estudante", xp: 0, level: 1 },
          unlockedAchievements: profile?.unlockedAchievements ?? [],
        });
      },

      clearStore: () =>
        set({
          userId: null,
          initialized: false,
          groups: [],
          tasks: [],
          sessions: [],
          exercises: [],
          trainings: [],
          user: { name: "Estudante", xp: 0, level: 1 },
          unlockedAchievements: [],
        }),

      // ── Groups ──────────────────────────────────────────────────────────────
      addGroup: (group) => {
        const newGroup: StudyGroup = { ...group, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ groups: [...s.groups, newGroup] }));
        const { userId } = get();
        if (userId) db.insertGroup(userId, newGroup).catch(console.error);
        get().checkAchievements();
      },

      updateGroup: (id, updates) => {
        set((s) => ({ groups: s.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
        const { userId } = get();
        if (userId) db.patchGroup(id, updates).catch(console.error);
      },

      deleteGroup: (id) => {
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          tasks: s.tasks.map((t) => t.groupId === id ? { ...t, groupId: null } : t),
          sessions: s.sessions.map((s2) => s2.groupId === id ? { ...s2, groupId: null } : s2),
          exercises: s.exercises.map((e) => e.groupId === id ? { ...e, groupId: null } : e),
          trainings: s.trainings.map((t) => t.groupId === id ? { ...t, groupId: null } : t),
          activeGroupId: s.activeGroupId === id ? null : s.activeGroupId,
        }));
        const { userId } = get();
        if (userId) db.removeGroup(id).catch(console.error);
      },

      setActiveGroup: (id) => set({ activeGroupId: id }),

      // ── Tasks ────────────────────────────────────────────────────────────────
      addTask: (task) => {
        const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ tasks: [newTask, ...s.tasks] }));
        const { userId } = get();
        if (userId) db.insertTask(userId, newTask).catch(console.error);
        get().addXP(5);
        get().checkAchievements();
      },

      updateTask: (id, updates) => {
        const completedNow = updates.status === "done" && get().tasks.find((t) => t.id === id)?.status !== "done";
        const finalUpdates = completedNow
          ? { ...updates, completedAt: new Date().toISOString() }
          : updates;
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...finalUpdates } : t)),
        }));
        const { userId } = get();
        if (userId) db.patchTask(id, finalUpdates).catch(console.error);
        if (completedNow) get().addXP(10);
        get().checkAchievements();
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        const { userId } = get();
        if (userId) db.removeTask(id).catch(console.error);
      },

      // ── Sessions ─────────────────────────────────────────────────────────────
      addSession: (session) => {
        const newSession: Session = { ...session, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ sessions: [newSession, ...s.sessions] }));
        const { userId } = get();
        if (userId) db.insertSession(userId, newSession).catch(console.error);
        get().addXP(Math.max(Math.floor(session.durationMin / 30) * 5, 5));
        get().checkAchievements();
      },

      deleteSession: (id) => {
        set((s) => ({ sessions: s.sessions.filter((s2) => s2.id !== id) }));
        const { userId } = get();
        if (userId) db.removeSession(id).catch(console.error);
      },

      // ── Exercises ────────────────────────────────────────────────────────────
      addExercise: (exercise) => {
        const newExercise: Exercise = { ...exercise, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ exercises: [newExercise, ...s.exercises] }));
        const { userId } = get();
        if (userId) db.insertExercise(userId, newExercise).catch(console.error);
        get().addXP(20);
        get().checkAchievements();
      },

      updateExercise: (id, updates) => {
        set((s) => ({ exercises: s.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
        const { userId } = get();
        if (userId) db.patchExercise(id, updates).catch(console.error);
      },

      // ── Trainings ────────────────────────────────────────────────────────────
      addTraining: (training) => {
        const newTraining: CodeTraining = { ...training, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ trainings: [newTraining, ...s.trainings] }));
        get().addXP(15);
      },

      // ── XP / Achievements ────────────────────────────────────────────────────
      addXP: (amount) => {
        const { user, userId } = get();
        const newXP = user.xp + amount;
        const newUser = { ...user, xp: newXP, level: Math.floor(newXP / 100) + 1 };
        set({ user: newUser });
        if (userId) db.upsertProfile(userId, { xp: newUser.xp, level: newUser.level }).catch(console.error);
      },

      checkAchievements: () => {
        const { tasks, sessions, exercises, groups, user, unlockedAchievements, userId } = get();
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
          const newUnlocked = [...unlockedAchievements, ...toUnlock];
          const xp = toUnlock.reduce((a, k) => a + (ACHIEVEMENTS.find((x) => x.key === k)?.xpReward ?? 0), 0);
          set({ unlockedAchievements: newUnlocked });
          if (userId) db.upsertProfile(userId, { unlocked_achievements: newUnlocked }).catch(console.error);
          if (xp > 0) get().addXP(xp);
        }
      },
    }),
    {
      name: "cognix-store",
      // Só persiste preferências de UI no localStorage — dados reais vêm do Supabase
      partialize: (s) => ({ activeGroupId: s.activeGroupId }),
    }
  )
);

// ── Filtered selectors ────────────────────────────────────────────────────────
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
