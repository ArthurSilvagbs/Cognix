import { createClient } from "./client";
import type { StudyGroup, Task, Session, Exercise } from "../store";

// ── Profile ───────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string) {
  const { data } = await createClient()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (!data) return null;
  return {
    name: data.name as string,
    xp: data.xp as number,
    level: data.level as number,
    unlockedAchievements: (data.unlocked_achievements ?? []) as string[],
  };
}

export async function upsertProfile(
  userId: string,
  updates: { name?: string; xp?: number; level?: number; unlocked_achievements?: string[] }
) {
  await createClient()
    .from("profiles")
    .upsert({ id: userId, ...updates });
}

// ── Groups ────────────────────────────────────────────────────────────────────

export async function fetchGroups(userId: string): Promise<StudyGroup[]> {
  const { data } = await createClient()
    .from("groups")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    color: r.color,
    emoji: r.emoji,
    createdAt: r.created_at,
  }));
}

export async function insertGroup(userId: string, g: StudyGroup) {
  await createClient().from("groups").insert({
    id: g.id, user_id: userId, name: g.name,
    description: g.description ?? null, color: g.color,
    emoji: g.emoji, created_at: g.createdAt,
  });
}

export async function patchGroup(id: string, u: Partial<StudyGroup>) {
  const row: Record<string, unknown> = {};
  if (u.name !== undefined) row.name = u.name;
  if (u.description !== undefined) row.description = u.description;
  if (u.color !== undefined) row.color = u.color;
  if (u.emoji !== undefined) row.emoji = u.emoji;
  await createClient().from("groups").update(row).eq("id", id);
}

export async function removeGroup(id: string) {
  await createClient().from("groups").delete().eq("id", id);
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data } = await createClient()
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    groupId: r.group_id ?? null,
    title: r.title,
    subject: r.subject,
    priority: r.priority,
    type: r.type,
    status: r.status,
    dueDate: r.due_date ?? undefined,
    estimatedMin: r.estimated_min,
    description: r.description ?? undefined,
    createdAt: r.created_at,
    completedAt: r.completed_at ?? undefined,
  }));
}

export async function insertTask(userId: string, t: Task) {
  await createClient().from("tasks").insert({
    id: t.id, user_id: userId, group_id: t.groupId ?? null,
    title: t.title, subject: t.subject, priority: t.priority,
    type: t.type, status: t.status, due_date: t.dueDate ?? null,
    estimated_min: t.estimatedMin, description: t.description ?? null,
    created_at: t.createdAt, completed_at: t.completedAt ?? null,
  });
}

export async function patchTask(id: string, u: Partial<Task>) {
  const row: Record<string, unknown> = {};
  if (u.title !== undefined) row.title = u.title;
  if (u.subject !== undefined) row.subject = u.subject;
  if (u.priority !== undefined) row.priority = u.priority;
  if (u.type !== undefined) row.type = u.type;
  if (u.status !== undefined) row.status = u.status;
  if (u.dueDate !== undefined) row.due_date = u.dueDate;
  if (u.estimatedMin !== undefined) row.estimated_min = u.estimatedMin;
  if (u.description !== undefined) row.description = u.description;
  if (u.groupId !== undefined) row.group_id = u.groupId;
  if (u.completedAt !== undefined) row.completed_at = u.completedAt;
  await createClient().from("tasks").update(row).eq("id", id);
}

export async function removeTask(id: string) {
  await createClient().from("tasks").delete().eq("id", id);
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function fetchSessions(userId: string): Promise<Session[]> {
  const { data } = await createClient()
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    groupId: r.group_id ?? null,
    subject: r.subject,
    durationMin: r.duration_min,
    date: r.date,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function insertSession(userId: string, s: Session) {
  await createClient().from("sessions").insert({
    id: s.id, user_id: userId, group_id: s.groupId ?? null,
    subject: s.subject, duration_min: s.durationMin,
    date: s.date, notes: s.notes ?? null, created_at: s.createdAt,
  });
}

export async function removeSession(id: string) {
  await createClient().from("sessions").delete().eq("id", id);
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export async function fetchExercises(userId: string): Promise<Exercise[]> {
  const { data } = await createClient()
    .from("exercises")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    groupId: r.group_id ?? null,
    title: r.title,
    language: r.language,
    difficulty: r.difficulty,
    topicTags: r.topic_tags ?? [],
    description: r.description,
    starterCode: r.starter_code ?? undefined,
    userCode: r.user_code ?? undefined,
    status: r.status,
    isStarred: r.is_starred,
    feedback: r.feedback ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function insertExercise(userId: string, e: Exercise) {
  await createClient().from("exercises").insert({
    id: e.id, user_id: userId, group_id: e.groupId ?? null,
    title: e.title, language: e.language, difficulty: e.difficulty,
    topic_tags: e.topicTags, description: e.description,
    starter_code: e.starterCode ?? null, user_code: e.userCode ?? null,
    status: e.status, is_starred: e.isStarred,
    feedback: e.feedback ?? null, created_at: e.createdAt,
  });
}

export async function patchExercise(id: string, u: Partial<Exercise>) {
  const row: Record<string, unknown> = {};
  if (u.title !== undefined) row.title = u.title;
  if (u.status !== undefined) row.status = u.status;
  if (u.userCode !== undefined) row.user_code = u.userCode;
  if (u.feedback !== undefined) row.feedback = u.feedback;
  if (u.isStarred !== undefined) row.is_starred = u.isStarred;
  if (u.groupId !== undefined) row.group_id = u.groupId;
  await createClient().from("exercises").update(row).eq("id", id);
}
