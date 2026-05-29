"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";

export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "study" | "review" | "practice" | "project";
export type TaskStatus = "pending" | "in_progress" | "done";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Task {
  id: string;
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
  subject: string;
  durationMin: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
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
  { key: "first_task", name: "Primeira Tarefa", description: "Complete sua primeira tarefa", icon: "🎯", xpReward: 10 },
  { key: "first_code", name: "Primeiro Código", description: "Complete seu primeiro exercício", icon: "💻", xpReward: 20 },
  { key: "5_sessions", name: "5 Sessões", description: "Registre 5 sessões de estudo", icon: "📚", xpReward: 30 },
  { key: "10_tasks", name: "10 Tarefas Feitas", description: "Complete 10 tarefas", icon: "🔥", xpReward: 50 },
  { key: "5_exercises", name: "5 Exercícios", description: "Complete 5 exercícios", icon: "⚡", xpReward: 40 },
  { key: "level_5", name: "Nível 5", description: "Alcance o nível 5", icon: "🏆", xpReward: 100 },
  { key: "10h_studied", name: "10h Estudadas", description: "Estude 10 horas no total", icon: "⏱️", xpReward: 60 },
  { key: "level_10", name: "Nível 10", description: "Alcance o nível 10", icon: "🌟", xpReward: 200 },
];

interface AppState {
  tasks: Task[];
  sessions: Session[];
  exercises: Exercise[];
  trainings: CodeTraining[];
  user: { name: string; xp: number; level: number };
  unlockedAchievements: string[];

  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addSession: (session: Omit<Session, "id" | "createdAt">) => void;
  deleteSession: (id: string) => void;

  addExercise: (exercise: Omit<Exercise, "id" | "createdAt">) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;

  addTraining: (training: Omit<CodeTraining, "id" | "createdAt">) => void;

  addXP: (amount: number) => void;
  checkAchievements: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      sessions: [],
      exercises: [],
      trainings: [],
      user: { name: "Estudante", xp: 0, level: 1 },
      unlockedAchievements: [],

      addTask: (task) => {
        set((s) => ({ tasks: [{ ...task, id: generateId(), createdAt: new Date().toISOString() }, ...s.tasks] }));
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

      addSession: (session) => {
        set((s) => ({ sessions: [{ ...session, id: generateId(), createdAt: new Date().toISOString() }, ...s.sessions] }));
        const xp = Math.floor(session.durationMin / 30) * 5;
        get().addXP(Math.max(xp, 5));
        get().checkAchievements();
      },

      deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter((s) => s.id !== id) })),

      addExercise: (exercise) => {
        set((s) => ({ exercises: [{ ...exercise, id: generateId(), createdAt: new Date().toISOString() }, ...s.exercises] }));
        get().addXP(20);
        get().checkAchievements();
      },

      updateExercise: (id, updates) => {
        set((s) => ({ exercises: s.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
        get().checkAchievements();
      },

      addTraining: (training) => {
        set((s) => ({ trainings: [{ ...training, id: generateId(), createdAt: new Date().toISOString() }, ...s.trainings] }));
        get().addXP(15);
      },

      addXP: (amount) => {
        set((s) => {
          const newXP = s.user.xp + amount;
          const newLevel = Math.floor(newXP / 100) + 1;
          return { user: { ...s.user, xp: newXP, level: newLevel } };
        });
      },

      checkAchievements: () => {
        const { tasks, sessions, exercises, user, unlockedAchievements } = get();
        const toUnlock: string[] = [];

        const doneTasks = tasks.filter((t) => t.status === "done").length;
        const doneExercises = exercises.filter((e) => e.status === "done").length;
        const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);

        if (doneTasks >= 1 && !unlockedAchievements.includes("first_task")) toUnlock.push("first_task");
        if (doneExercises >= 1 && !unlockedAchievements.includes("first_code")) toUnlock.push("first_code");
        if (sessions.length >= 5 && !unlockedAchievements.includes("5_sessions")) toUnlock.push("5_sessions");
        if (doneTasks >= 10 && !unlockedAchievements.includes("10_tasks")) toUnlock.push("10_tasks");
        if (doneExercises >= 5 && !unlockedAchievements.includes("5_exercises")) toUnlock.push("5_exercises");
        if (user.level >= 5 && !unlockedAchievements.includes("level_5")) toUnlock.push("level_5");
        if (totalMinutes >= 600 && !unlockedAchievements.includes("10h_studied")) toUnlock.push("10h_studied");
        if (user.level >= 10 && !unlockedAchievements.includes("level_10")) toUnlock.push("level_10");

        if (toUnlock.length > 0) {
          const xpReward = toUnlock.reduce((acc, key) => {
            const ach = ACHIEVEMENTS.find((a) => a.key === key);
            return acc + (ach?.xpReward ?? 0);
          }, 0);
          set((s) => ({ unlockedAchievements: [...s.unlockedAchievements, ...toUnlock] }));
          if (xpReward > 0) get().addXP(xpReward);
        }
      },
    }),
    { name: "cognix-store" }
  )
);
