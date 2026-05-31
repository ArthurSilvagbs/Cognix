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

export interface Subject {
  id: string;
  groupId: string;
  name: string;
  createdAt: string;
}

export type SessionType = "content" | "review" | "exercises" | "simulado";
export const SESSION_TYPE_CONFIG: Record<SessionType, { label: string; emoji: string }> = {
  content:   { label: "Conteúdo",   emoji: "📖" },
  review:    { label: "Revisão",    emoji: "🔄" },
  exercises: { label: "Exercícios", emoji: "📝" },
  simulado:  { label: "Simulado",   emoji: "🎯" },
};

export interface StudyPlanDay {
  id: string;
  dayOfWeek: number;
  plannedMin: number;
  createdAt: string;
}

export interface StudyPlanItem {
  id: string;
  dayOfWeek: number;
  date?: string;
  groupId: string | null;
  subject: string;
  sessionType: SessionType;
  description?: string;
  position: number;
  createdAt: string;
}

export interface Session {
  id: string;
  cycleId: string | null;
  groupId: string | null;
  subject: string;
  durationMin: number;
  actualMin?: number;
  date: string;
  notes?: string;
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
  { key: "first_task",  name: "Primeira Tarefa",  description: "Complete sua primeira tarefa",    icon: "🎯", xpReward: 10  },
  { key: "first_code",  name: "Primeiro Código",  description: "Complete seu primeiro exercício", icon: "💻", xpReward: 20  },
  { key: "10_tasks",    name: "10 Tarefas Feitas", description: "Complete 10 tarefas",             icon: "🔥", xpReward: 50  },
  { key: "5_exercises", name: "5 Exercícios",      description: "Complete 5 exercícios",           icon: "⚡", xpReward: 40  },
  { key: "level_5",     name: "Nível 5",           description: "Alcance o nível 5",              icon: "🏆", xpReward: 100 },
  { key: "level_10",    name: "Nível 10",          description: "Alcance o nível 10",             icon: "🌟", xpReward: 200 },
  { key: "3_groups",    name: "3 Áreas",           description: "Crie 3 grupos de estudo",        icon: "🗂️", xpReward: 25  },
];

export const GROUP_COLORS = [
  { value: "#2563eb", label: "Azul"      },
  { value: "#0891b2", label: "Ciano"     },
  { value: "#059669", label: "Verde"     },
  { value: "#65a30d", label: "Lima"      },
  { value: "#d97706", label: "Ambar"     },
  { value: "#ea580c", label: "Coral"     },
  { value: "#dc2626", label: "Vermelho"  },
  { value: "#be123c", label: "Cereja"    },
  { value: "#0d9488", label: "Teal"      },
  { value: "#475569", label: "Ardosia"   },
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
  exercises: Exercise[];
  trainings: CodeTraining[];
  subjects: Subject[];
  planDays: StudyPlanDay[];
  planItems: StudyPlanItem[];
  sessions: Session[];

  // User
  user: { name: string; xp: number; level: number };
  unlockedAchievements: string[];

  // Sync actions
  setUserId: (id: string | null) => void;
  hydrateFromSupabase: (data: {
    groups: StudyGroup[];
    tasks: Task[];
    exercises: Exercise[];
    subjects: Subject[];
    planDays: StudyPlanDay[];
    planItems: StudyPlanItem[];
    sessions: Session[];
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

  // Exercise actions
  addExercise: (exercise: Omit<Exercise, "id" | "createdAt">) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;

  // Subject actions
  addSubject: (groupId: string, name: string) => void;
  deleteSubject: (id: string) => void;

  // Plan actions
  savePlan: (configs: { dayOfWeek: number; plannedMin: number }[]) => void;
  savePlanItems: (dayOfWeek: number, items: { groupId: string | null; subject: string; sessionType: SessionType; description?: string }[], date?: string) => void;

  // Session actions
  addSession: (session: Omit<Session, "id" | "createdAt">) => void;
  updateSession: (id: string, updates: Partial<Omit<Session, "id" | "createdAt">>) => void;
  deleteSession: (id: string) => void;

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
      exercises: [],
      trainings: [],
      subjects: [],
      planDays: [],
      planItems: [],
      sessions: [],
      user: { name: "Estudante", xp: 0, level: 1 },
      unlockedAchievements: [],

      // ── Sync ────────────────────────────────────────────────────────────────
      setUserId: (id) => {
        const currentUserId = get().userId;
        if (currentUserId && id && currentUserId !== id) {
          set({ userId: id, planItems: [], sessions: [], activeGroupId: null });
          return;
        }
        set({ userId: id });
      },

      hydrateFromSupabase: ({ groups, tasks, exercises, subjects, planDays, planItems, sessions, profile }) => {
        const localState = get();
        const localDatePlanItems = localState.planItems.filter((item) => item.date);
        const mergedPlanItems = [
          ...planItems,
          ...localDatePlanItems.filter((localItem) => !planItems.some((item) => item.id === localItem.id)),
        ];
        const mergedSessions = [
          ...sessions,
          ...localState.sessions.filter((localSession) => !sessions.some((session) => session.id === localSession.id)),
        ];

        set({
          initialized: true,
          groups,
          tasks,
          exercises,
          subjects,
          planDays,
          planItems: mergedPlanItems,
          sessions: mergedSessions,
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
          exercises: [],
          trainings: [],
          subjects: [],
          planDays: [],
          planItems: [],
          sessions: [],
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

      // ── Subjects ─────────────────────────────────────────────────────────────
      addSubject: (groupId, name) => {
        const newSubject: Subject = { id: generateId(), groupId, name, createdAt: new Date().toISOString() };
        set((s) => ({ subjects: [...s.subjects, newSubject] }));
        const { userId } = get();
        if (userId) db.insertSubject(userId, newSubject).catch(console.error);
      },

      deleteSubject: (id) => {
        set((s) => ({ subjects: s.subjects.filter((s) => s.id !== id) }));
        db.removeSubject(id).catch(console.error);
      },

      // ── Plan ─────────────────────────────────────────────────────────────────
      savePlan: (configs) => {
        const { planDays, userId } = get();
        const newDayNums = new Set(configs.map((c) => c.dayOfWeek));
        const toRemove = planDays.filter((d) => !newDayNums.has(d.dayOfWeek));
        const newPlanDays: StudyPlanDay[] = configs.map((config) => {
          const existing = planDays.find((d) => d.dayOfWeek === config.dayOfWeek);
          return existing
            ? { ...existing, plannedMin: config.plannedMin }
            : { id: generateId(), dayOfWeek: config.dayOfWeek, plannedMin: config.plannedMin, createdAt: new Date().toISOString() };
        });
        set({ planDays: newPlanDays });
        if (userId) {
          for (const pd of newPlanDays) db.upsertPlanDay(userId, pd).catch(console.error);
          for (const pd of toRemove) db.removePlanDay(userId, pd.dayOfWeek).catch(console.error);
        }
      },

      savePlanItems: (dayOfWeek, items, date) => {
        const { userId } = get();
        const newItems: StudyPlanItem[] = items.map((item, i) => ({
          id: generateId(),
          dayOfWeek,
          date,
          groupId: item.groupId,
          subject: item.subject,
          sessionType: item.sessionType,
          description: item.description || undefined,
          position: i,
          createdAt: new Date().toISOString(),
        }));
        set((s) => ({
          planItems: [
            ...s.planItems.filter((pi) => (date ? pi.date !== date : pi.dayOfWeek !== dayOfWeek || Boolean(pi.date))),
            ...newItems,
          ],
        }));
        if (userId) db.replacePlanItems(userId, dayOfWeek, newItems, date).catch(console.error);
      },

      // ── Sessions ─────────────────────────────────────────────────────────────
      addSession: (session) => {
        const newSession: Session = { ...session, id: generateId(), createdAt: new Date().toISOString() };
        set((s) => ({ sessions: [newSession, ...s.sessions] }));
        const { userId } = get();
        if (userId) db.insertSession(userId, newSession).catch(console.error);
        get().addXP(8);
      },

      updateSession: (id, updates) => {
        set((s) => ({ sessions: s.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)) }));
        db.patchSession(id, updates).catch(console.error);
      },

      deleteSession: (id) => {
        set((s) => ({ sessions: s.sessions.filter((s) => s.id !== id) }));
        db.removeSession(id).catch(console.error);
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
        const { tasks, exercises, groups, user, unlockedAchievements, userId } = get();
        const toUnlock: string[] = [];
        const done = (arr: { status: string }[]) => arr.filter((x) => x.status === "done").length;

        const check = (key: string, cond: boolean) => {
          if (cond && !unlockedAchievements.includes(key)) toUnlock.push(key);
        };
        check("first_task",  done(tasks) >= 1);
        check("first_code",  done(exercises) >= 1);
        check("10_tasks",    done(tasks) >= 10);
        check("5_exercises", done(exercises) >= 5);
        check("level_5",     user.level >= 5);
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
      partialize: (s) => ({
        userId: s.userId,
        activeGroupId: s.activeGroupId,
        planItems: s.planItems.filter((item) => item.date),
        sessions: s.sessions,
      }),
    }
  )
);

// ── Filtered selectors ────────────────────────────────────────────────────────
export function useGroupData() {
  const { tasks, exercises, trainings, activeGroupId } = useStore();
  const filter = <T extends { groupId: string | null }>(arr: T[]) =>
    activeGroupId === null ? arr : arr.filter((x) => x.groupId === activeGroupId);
  return {
    tasks: filter(tasks),
    exercises: filter(exercises),
    trainings: filter(trainings),
    activeGroupId,
  };
}
