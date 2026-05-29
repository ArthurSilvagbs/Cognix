"use client";

import { TrendingUp, Trophy } from "lucide-react";
import { useStore, ACHIEVEMENTS } from "@/lib/store";
import { formatMinutes, cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = ["#7C3AED", "#2563EB", "#059669", "#EA580C", "#DB2777", "#0891B2", "#F59E0B"];

export default function EvolutionPage() {
  const { user, tasks, sessions, exercises, unlockedAchievements } = useStore();

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const doneExercises = exercises.filter((e) => e.status === "done").length;
  const totalMinutes = sessions.reduce((a, s) => a + s.durationMin, 0);
  const xpToNext = 100 - (user.xp % 100);
  const xpInLevel = user.xp % 100;

  // Last 14 days chart
  const today = new Date();
  const last14: { day: string; minutes: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const minutes = sessions
      .filter((s) => s.date === dateStr)
      .reduce((a, s) => a + s.durationMin, 0);
    last14.push({
      day: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      minutes,
    });
  }

  // Subjects progress
  const subjectMap = tasks.reduce<Record<string, { done: number; total: number }>>((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = { done: 0, total: 0 };
    acc[t.subject].total++;
    if (t.status === "done") acc[t.subject].done++;
    return acc;
  }, {});
  const subjectData = Object.entries(subjectMap).slice(0, 5);

  // Language donut
  const languageMap = exercises.reduce<Record<string, number>>((acc, e) => {
    acc[e.language] = (acc[e.language] ?? 0) + 1;
    return acc;
  }, {});
  const languageData = Object.entries(languageMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evolução de Conhecimento</h1>
          <p className="text-sm text-gray-500">Acompanhe seu progresso e conquistas</p>
        </div>
      </div>

      {/* Level card */}
      <div className="bg-linear-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm">Seu Nível</p>
            <p className="text-5xl font-bold mt-1">Nv. {user.level}</p>
            <p className="text-white/70 text-sm mt-1">{user.xp} XP total</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mb-1 flex justify-between text-xs text-white/70">
          <span>{xpInLevel} / 100 XP para o próximo nível</span>
          <span>{xpToNext} XP faltando</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: "✅", label: "Tarefas", value: doneTasks },
            { icon: "💻", label: "Exercícios", value: doneExercises },
            { icon: "📚", label: `${sessions.length} sessões`, value: formatMinutes(totalMinutes), sub: "estudo" },
          ].map((s) => (
            <div key={s.label} className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-white/70">{s.label}</div>
              {s.sub && <div className="text-xs text-white/60">{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hours chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            📅 Horas Estudadas — Últimos 14 Dias
          </h3>
          {totalMinutes === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <span className="text-3xl mb-2">📖</span>
              <p className="text-sm">Nenhuma sessão registrada ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last14} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v) => [formatMinutes(Number(v)), "Tempo"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Bar dataKey="minutes" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Language donut */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            {"</>"} Exercícios por Linguagem
          </h3>
          {languageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <span className="text-3xl mb-2">💻</span>
              <p className="text-sm">Nenhum exercício ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={languageData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {languageData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subject progress */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
          ✅ Progresso por Matéria
        </h3>
        {subjectData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhuma tarefa registrada</p>
        ) : (
          <div className="space-y-3">
            {subjectData.map(([subject, { done, total }]) => (
              <div key={subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{subject}</span>
                  <span className="text-gray-500">{done}/{total} tarefas</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
          ⭐ Conquistas
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = unlockedAchievements.includes(ach.key);
            return (
              <div
                key={ach.key}
                className={cn(
                  "rounded-xl border p-4 text-center transition-all",
                  unlocked ? "border-yellow-200 bg-yellow-50" : "border-gray-100 bg-gray-50 opacity-60"
                )}
              >
                <div className="text-3xl mb-2">{ach.icon}</div>
                <p className={cn("text-xs font-semibold", unlocked ? "text-gray-800" : "text-gray-500")}>{ach.name}</p>
                {unlocked && (
                  <span className="inline-block mt-1 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                    Desbloqueada!
                  </span>
                )}
                {!unlocked && <p className="text-xs text-gray-400 mt-1 leading-tight">{ach.description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
