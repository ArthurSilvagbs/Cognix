"use client";

import Link from "next/link";
import {
  CheckSquare, Code2, RefreshCw,
  TrendingUp, MessageSquare, ArrowRight, Star, Zap,
} from "lucide-react";
import { useStore, useGroupData } from "@/lib/store";
import { formatDate, getGreeting } from "@/lib/utils";

const exploreCards = [
  {
    href: "/tasks", label: "Tarefas", sub: "Organize suas metas",
    icon: CheckSquare, bg: "#7c3aed",
  },
  {
    href: "/exercises", label: "Exercícios", sub: "Pratique com IA",
    icon: Code2, bg: "#059669",
  },
  {
    href: "/training", label: "Treino", sub: "Memorize código",
    icon: RefreshCw, bg: "#d97706",
  },
  {
    href: "/evolution", label: "Evolução", sub: "Acompanhe progresso",
    icon: TrendingUp, bg: "#db2777",
  },
  {
    href: "/tutor", label: "Tutor IA", sub: "Tire dúvidas",
    icon: MessageSquare, bg: "#4f46e5",
  },
];

export default function DashboardPage() {
  const { tasks, exercises, activeGroupId } = useGroupData();
  const { groups, user } = useStore();
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const doneExercises = exercises.filter((e) => e.status === "done").length;
  const pendingTasks = tasks.filter((t) => t.status !== "done").slice(0, 4);
  const recentExercises = exercises.slice(0, 3);

  const subjectMap = tasks.reduce<Record<string, { done: number; total: number }>>((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = { done: 0, total: 0 };
    acc[t.subject].total++;
    if (t.status === "done") acc[t.subject].done++;
    return acc;
  }, {});
  const topSubjects = Object.entries(subjectMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 4);

  const today = new Date();

  const stats = [
    { label: "Tarefas feitas",    value: doneTasks         },
    { label: "Exercícios feitos", value: doneExercises     },
    { label: "XP total",          value: user.xp           },
    { label: "Nível atual",       value: `Nv. ${user.level}` },
  ];

  return (
    <div className="p-7 max-w-7xl mx-auto space-y-7">

      {/* Hero banner */}
      <div
        className="relative rounded-2xl overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #5b21b6 0%, #6d28d9 40%, #4338ca 100%)",
          boxShadow: "0 8px 32px -4px rgb(109 40 217 / 0.3), 0 2px 8px -2px rgb(109 40 217 / 0.2)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgb(255 255 255) 1px, transparent 1px),
              linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }}
        />

        <div className="relative px-7 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-violet-300 text-xs font-medium tracking-wide uppercase mb-1">
                {formatDate(today)}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                {getGreeting()}!{activeGroup ? ` — ${activeGroup.emoji} ${activeGroup.name}` : ""}
              </h1>
              <p className="text-violet-200 text-sm mt-1">
                {pendingTasks.length === 0
                  ? "Nenhuma tarefa pendente. Que tal um novo desafio?"
                  : `${pendingTasks.length} tarefa${pendingTasks.length > 1 ? "s" : ""} pendente${pendingTasks.length > 1 ? "s" : ""} para hoje`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/tutor"
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all"
                style={{ background: "rgb(255 255 255 / 0.15)", border: "1px solid rgb(255 255 255 / 0.2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(255 255 255 / 0.22)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(255 255 255 / 0.15)")}
              >
                <Zap className="w-3.5 h-3.5" /> Tutor IA
              </Link>
              <Link
                href="/training"
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all"
                style={{ background: "rgb(255 255 255 / 0.15)", border: "1px solid rgb(255 255 255 / 0.2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(255 255 255 / 0.22)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(255 255 255 / 0.15)")}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Treinar Código
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl px-4 py-3"
                style={{ background: "rgb(255 255 255 / 0.12)", border: "1px solid rgb(255 255 255 / 0.15)" }}
              >
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-violet-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Explorar</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {exploreCards.map(({ href, label, sub, icon: Icon, bg }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl p-4 flex flex-col items-start gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: `${bg}18`, border: `1px solid ${bg}30` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${bg}55`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${bg}30`; }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: bg }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pending tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Tarefas Pendentes</h3>
            </div>
            <Link
              href="/tasks"
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <CheckSquare className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Tudo em dia!</p>
              <p className="text-xs text-slate-400 mt-0.5">Crie novas tarefas de estudo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors hover:bg-slate-50"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background:
                        task.priority === "high" ? "#ef4444" :
                        task.priority === "medium" ? "#f59e0b" : "#22c55e",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.subject}</p>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={
                      task.status === "in_progress"
                        ? { background: "var(--color-info-bg)", color: "var(--color-info-text)" }
                        : { background: "var(--color-warning-bg)", color: "var(--color-warning-text)" }
                    }
                  >
                    {task.status === "in_progress" ? "Em andamento" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress by subject */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Progresso por Matéria</h3>
            </div>
            <Link
              href="/evolution"
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
            >
              Evolução <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {topSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <CheckSquare className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhuma tarefa ainda</p>
              <Link href="/tasks" className="text-xs text-violet-600 hover:text-violet-800 mt-1 font-medium">
                Criar tarefa
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {topSubjects.map(([subject, { done, total }], i) => (
                <div key={subject}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{subject}</span>
                    <span className="text-xs text-slate-400 font-medium">{done}/{total}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-subtle)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${total > 0 ? (done / total) * 100 : 0}%`,
                        background: i === 0 ? "#7c3aed" : i === 1 ? "#0891b2" : i === 2 ? "#059669" : "#d97706",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent exercises */}
      {recentExercises.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Últimos Exercícios</h2>
            <Link href="/exercises" className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recentExercises.map((ex) => (
              <Link
                key={ex.id}
                href="/exercises"
                className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{ background: "var(--surface-subtle)", color: "var(--text-secondary)" }}
                  >
                    {ex.language}
                  </span>
                  {ex.isStarred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">{ex.title}</p>
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {ex.topicTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs text-slate-400">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
