"use client";

import Link from "next/link";
import {
  CheckSquare, BookOpen, Code2, RefreshCw,
  TrendingUp, MessageSquare, ArrowRight, Star, Zap,
} from "lucide-react";
import { useStore, useGroupData } from "@/lib/store";
import { formatDate, formatMinutes, getGreeting } from "@/lib/utils";

const exploreCards = [
  {
    href: "/tasks", label: "Tarefas", sub: "Organize suas metas",
    icon: CheckSquare,
    bg: "#7c3aed", light: "#ede9fe", text: "#5b21b6",
  },
  {
    href: "/sessions", label: "Sessões", sub: "Registre tempo estudado",
    icon: BookOpen,
    bg: "#0891b2", light: "#e0f2fe", text: "#0369a1",
  },
  {
    href: "/exercises", label: "Exercícios", sub: "Pratique com IA",
    icon: Code2,
    bg: "#059669", light: "#d1fae5", text: "#047857",
  },
  {
    href: "/training", label: "Treino", sub: "Memorize código",
    icon: RefreshCw,
    bg: "#d97706", light: "#fef3c7", text: "#b45309",
  },
  {
    href: "/evolution", label: "Evolução", sub: "Acompanhe progresso",
    icon: TrendingUp,
    bg: "#db2777", light: "#fce7f3", text: "#9d174d",
  },
  {
    href: "/tutor", label: "Tutor IA", sub: "Tire dúvidas",
    icon: MessageSquare,
    bg: "#4f46e5", light: "#e0e7ff", text: "#3730a3",
  },
];

export default function DashboardPage() {
  const { tasks, sessions, exercises, activeGroupId } = useGroupData();
  const { groups } = useStore();
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);
  const pendingTasks = tasks.filter((t) => t.status !== "done").slice(0, 4);
  const recentExercises = exercises.slice(0, 3);

  const subjects = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.subject] = (acc[s.subject] ?? 0) + s.durationMin;
    return acc;
  }, {});
  const topSubjects = Object.entries(subjects).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const today = new Date();

  const stats = [
    { label: "Tarefas feitas", value: doneTasks, color: "#7c3aed" },
    { label: "Horas estudadas", value: formatMinutes(totalMinutes), color: "#0891b2" },
    { label: "Exercícios", value: exercises.length, color: "#059669" },
    { label: "Sessões", value: sessions.length, color: "#d97706" },
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
        {/* Grid pattern overlay */}
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

        {/* Radial glow */}
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

          {/* Stats */}
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
        <div className="grid grid-cols-6 gap-3">
          {exploreCards.map(({ href, label, sub, icon: Icon, bg, light }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl p-4 flex flex-col items-start gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: light,
                border: `1px solid ${bg}22`,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${bg}44`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${bg}22`; }}
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
                  style={{ border: "1px solid #f1f5f9" }}
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
                        ? { background: "#dbeafe", color: "#1d4ed8" }
                        : { background: "#fff7ed", color: "#c2410c" }
                    }
                  >
                    {task.status === "in_progress" ? "Em andamento" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subjects studied */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Matérias Estudadas</h3>
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
                <BookOpen className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhuma sessão ainda</p>
              <Link href="/sessions" className="text-xs text-violet-600 hover:text-violet-800 mt-1 font-medium">
                Registrar sessão
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {topSubjects.map(([subject, minutes], i) => (
                <div key={subject}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{subject}</span>
                    <span className="text-xs text-slate-400 font-medium">{formatMinutes(minutes)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((minutes / totalMinutes) * 100, 100)}%`,
                        background: i === 0 ? "#7c3aed" : i === 1 ? "#0891b2" : "#059669",
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
                    style={{ background: "#f1f5f9", color: "#475569" }}
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
