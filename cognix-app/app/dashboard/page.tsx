"use client";

import Link from "next/link";
import {
  CheckSquare, BookOpen, Code2, RefreshCw, TrendingUp, MessageSquare,
  Zap, Star,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate, formatMinutes, getGreeting } from "@/lib/utils";

const exploreCards = [
  { href: "/tasks", label: "Tarefas", sub: "Organize", icon: CheckSquare, bg: "from-purple-500 to-purple-700" },
  { href: "/sessions", label: "Sessões", sub: "Registre", icon: BookOpen, bg: "from-cyan-400 to-teal-600" },
  { href: "/exercises", label: "Exercícios", sub: "Pratique", icon: Code2, bg: "from-teal-400 to-emerald-600" },
  { href: "/training", label: "Treino", sub: "Memorize", icon: RefreshCw, bg: "from-orange-400 to-orange-600" },
  { href: "/evolution", label: "Evolução", sub: "Acompanhe", icon: TrendingUp, bg: "from-pink-500 to-rose-600" },
  { href: "/tutor", label: "Tutor IA", sub: "Pergunte", icon: MessageSquare, bg: "from-indigo-500 to-purple-600" },
];

export default function DashboardPage() {
  const { tasks, sessions, exercises, user } = useStore();

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").slice(0, 3);
  const recentExercises = exercises.slice(0, 3);

  const subjects = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.subject] = (acc[s.subject] ?? 0) + s.durationMin;
    return acc;
  }, {});
  const topSubjects = Object.entries(subjects)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const today = new Date();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-purple-600 via-purple-500 to-blue-500 p-6 text-white">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm capitalize">{formatDate(today)}</p>
              <h1 className="text-3xl font-bold mt-0.5">
                {getGreeting()}! 🎓
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {pendingTasks.length === 0
                  ? "Nenhuma tarefa pendente. Que tal criar um novo desafio?"
                  : `Você tem ${pendingTasks.length} tarefa${pendingTasks.length > 1 ? "s" : ""} pendente${pendingTasks.length > 1 ? "s" : ""}.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/tutor"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm px-4 py-2 rounded-xl transition-colors"
              >
                <Zap className="w-4 h-4" />
                Tutor IA
              </Link>
              <Link
                href="/training"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm px-4 py-2 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Treinar Código
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tarefas Feitas", value: doneTasks, icon: "✅" },
              { label: "Horas Estudadas", value: formatMinutes(totalMinutes), icon: "⏱️" },
              { label: "Exercícios", value: exercises.length, icon: "💻" },
              { label: "Sessões", value: sessions.length, icon: "📚" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-white/70 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore */}
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">Explorar</p>
        <div className="grid grid-cols-6 gap-3">
          {exploreCards.map(({ href, label, sub, icon: Icon, bg }) => (
            <Link
              key={href}
              href={href}
              className={`bg-linear-to-br ${bg} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-white hover:opacity-90 hover:scale-105 transition-all aspect-square`}
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <p className="text-sm font-semibold leading-tight">{label}</p>
                <p className="text-xs text-white/70">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tarefas Pendentes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🔥</span>
              <h2 className="font-semibold text-gray-900 text-sm">Tarefas Pendentes</h2>
            </div>
            <Link href="/tasks" className="text-purple-600 text-sm hover:text-purple-800 flex items-center gap-1">
              Ver todas →
            </Link>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <span className="text-3xl mb-2">🏆</span>
              <p className="text-sm">Tudo em dia!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      task.priority === "high" ? "bg-red-400" : task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.subject}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      task.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {task.status === "in_progress" ? "Em andamento" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matérias Estudadas */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🎓</span>
              <h2 className="font-semibold text-gray-900 text-sm">Matérias Estudadas</h2>
            </div>
            <Link href="/evolution" className="text-purple-600 text-sm hover:text-purple-800">
              Evolução →
            </Link>
          </div>
          {topSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400 gap-2">
              <BookOpen className="w-8 h-8 text-gray-300" />
              <p className="text-sm">Nenhuma sessão registrada ainda</p>
              <Link href="/sessions" className="text-purple-600 text-sm hover:text-purple-800">
                Registrar sessão
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topSubjects.map(([subject, minutes]) => (
                <div key={subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{subject}</span>
                    <span className="text-gray-500">{formatMinutes(minutes)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.min((minutes / totalMinutes) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimos Exercícios */}
      {recentExercises.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Últimos Exercícios</p>
            <Link href="/exercises" className="text-purple-600 text-sm hover:text-purple-800">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recentExercises.map((ex) => (
              <Link
                key={ex.id}
                href="/exercises"
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                    {ex.language}
                  </span>
                  {ex.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{ex.title}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {ex.topicTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs text-gray-500">{tag}</span>
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
