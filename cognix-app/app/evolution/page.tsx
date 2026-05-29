"use client";

import { TrendingUp, Trophy, Flame, Code2, BookOpen } from "lucide-react";
import { useStore, ACHIEVEMENTS } from "@/lib/store";
import { formatMinutes, cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = ["#7c3aed","#0891b2","#059669","#d97706","#db2777","#4f46e5","#0284c7"];

export default function EvolutionPage() {
  const { user, tasks, sessions, exercises, unlockedAchievements } = useStore();

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const doneExercises = exercises.filter((e) => e.status === "done").length;
  const totalMinutes = sessions.reduce((a, s) => a + s.durationMin, 0);
  const xpInLevel = user.xp % 100;

  const today = new Date();
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    const dateStr = d.toISOString().split("T")[0];
    const minutes = sessions.filter((s) => s.date === dateStr).reduce((a, s) => a + s.durationMin, 0);
    return { day: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), minutes };
  });

  const subjectMap = tasks.reduce<Record<string, { done: number; total: number }>>((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = { done: 0, total: 0 };
    acc[t.subject].total++;
    if (t.status === "done") acc[t.subject].done++;
    return acc;
  }, {});

  const languageData = Object.entries(
    exercises.reduce<Record<string, number>>((acc, e) => { acc[e.language] = (acc[e.language] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-7 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Evolução de Conhecimento</h1>
        <p className="text-sm text-slate-400 mt-0.5">Acompanhe seu progresso e conquistas</p>
      </div>

      {/* Level card */}
      <div
        className="relative rounded-2xl p-6 text-white overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #5b21b6 0%, #6d28d9 40%, #4338ca 100%)",
          boxShadow: "0 8px 24px -4px rgb(109 40 217 / 0.25)",
        }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }} />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-violet-300 text-xs font-medium tracking-wide uppercase">Seu Nível</p>
              <p className="text-5xl font-bold mt-1 tracking-tight">Nv. {user.level}</p>
              <p className="text-violet-300 text-sm mt-1">{user.xp} XP total</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgb(255 255 255 / 0.15)" }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-violet-300 mb-1.5">
            <span>{xpInLevel} / 100 XP para o próximo nível</span>
            <span>{100 - xpInLevel} XP faltando</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgb(255 255 255 / 0.2)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${xpInLevel}%`, background: "white" }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: Flame, label: "Tarefas", value: doneTasks },
              { icon: Code2, label: "Exercícios", value: doneExercises },
              { icon: BookOpen, label: `${sessions.length} sessões`, value: formatMinutes(totalMinutes) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgb(255 255 255 / 0.12)" }}>
                <Icon className="w-4 h-4 text-violet-200 mx-auto mb-1" />
                <p className="text-xl font-bold">{value}</p>
                <p className="text-violet-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-800 mb-4">Horas Estudadas — 14 dias</p>
          {totalMinutes === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <BookOpen className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm">Nenhuma sessão ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last14} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v) => [formatMinutes(Number(v)), "Tempo"]}
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="minutes" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-800 mb-4">Exercícios por Linguagem</p>
          {languageData.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <Code2 className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm">Nenhum exercício ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={languageData} cx="50%" cy="45%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {languageData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#64748b" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subject progress */}
      {Object.keys(subjectMap).length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-800 mb-4">Progresso por Matéria</p>
          <div className="space-y-4">
            {Object.entries(subjectMap).slice(0, 6).map(([subject, { done, total }], i) => (
              <div key={subject}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{subject}</span>
                  <span className="text-slate-400 text-xs font-medium">{done}/{total} tarefas</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800 mb-4">Conquistas</p>
        <div className="grid grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = unlockedAchievements.includes(ach.key);
            return (
              <div
                key={ach.key}
                className={cn("rounded-xl p-4 text-center transition-all", unlocked ? "" : "opacity-50")}
                style={unlocked
                  ? { background: "#fefce8", border: "1px solid #fde68a" }
                  : { background: "#f8fafc", border: "1px solid #f1f5f9" }}
              >
                <div className="text-2xl mb-2">{ach.icon}</div>
                <p className={cn("text-xs font-semibold leading-tight", unlocked ? "text-slate-800" : "text-slate-500")}>{ach.name}</p>
                {unlocked ? (
                  <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#fbbf24", color: "#78350f" }}>Desbloqueada</span>
                ) : (
                  <p className="text-xs text-slate-400 mt-1 leading-tight">{ach.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
