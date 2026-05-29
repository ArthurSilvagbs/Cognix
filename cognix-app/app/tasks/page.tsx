"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Clock, SlidersHorizontal } from "lucide-react";
import { useStore, Task, TaskPriority, TaskStatus, TaskType } from "@/lib/store";
import { cn, formatMinutes } from "@/lib/utils";

type FilterTab = "all" | "pending" | "in_progress" | "done";

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; dot: string; label: string }> = {
  low:    { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", label: "Baixa" },
  medium: { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b", label: "Média" },
  high:   { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444", label: "Alta" },
};

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  pending:     { bg: "#fff7ed", text: "#c2410c", label: "Pendente" },
  in_progress: { bg: "#eff6ff", text: "#1d4ed8", label: "Em Andamento" },
  done:        { bg: "#f0fdf4", text: "#15803d", label: "Concluída" },
};

const TYPE_LABELS: Record<TaskType, string> = {
  study: "Estudo", review: "Revisão", practice: "Prática", project: "Projeto",
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendentes" },
  { key: "in_progress", label: "Em Andamento" },
  { key: "done", label: "Concluídas" },
];

interface FormData {
  title: string; subject: string; priority: TaskPriority;
  type: TaskType; dueDate: string; estimatedMin: number; description: string;
}

const EMPTY: FormData = { title: "", subject: "", priority: "medium", type: "study", dueDate: "", estimatedMin: 60, description: "" };

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  const [tab, setTab] = useState<FilterTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = tab === "all" ? tasks : tasks.filter((t) => t.status === tab);
  const done = tasks.filter((t) => t.status === "done").length;
  const pending = tasks.filter((t) => t.status !== "done").length;

  function openNew() { setForm(EMPTY); setEditId(null); setShowModal(true); }
  function openEdit(task: Task) {
    setForm({ title: task.title, subject: task.subject, priority: task.priority, type: task.type, dueDate: task.dueDate ?? "", estimatedMin: task.estimatedMin, description: task.description ?? "" });
    setEditId(task.id); setShowModal(true);
  }
  function handleSave() {
    if (!form.title.trim() || !form.subject.trim()) return;
    editId ? updateTask(editId, form) : addTask({ ...form, status: "pending" });
    setShowModal(false); setForm(EMPTY); setEditId(null);
  }
  function toggleDone(task: Task) {
    updateTask(task.id, task.status === "done" ? { status: "pending", completedAt: undefined } : { status: "done" });
  }

  return (
    <div className="p-7 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tarefas de Estudo</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            <span className="text-slate-600 font-medium">{pending}</span> pendente{pending !== 1 ? "s" : ""} ·{" "}
            <span className="text-slate-600 font-medium">{done}</span> concluída{done !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "#f1f5f9" }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all duration-150"
            style={tab === key
              ? { background: "#fff", color: "#0f172a", boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)" }
              : { background: "transparent", color: "#64748b" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#f1f5f9" }}>
            <SlidersHorizontal className="w-6 h-6 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">Nenhuma tarefa encontrada</p>
          <p className="text-sm text-slate-400 mt-1">Clique em &quot;Nova Tarefa&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const p = PRIORITY_STYLES[task.priority];
            const s = STATUS_STYLES[task.status];
            return (
              <div
                key={task.id}
                className="card flex items-start gap-3 px-4 py-3.5 hover:shadow-sm transition-all duration-150"
                style={task.status === "done" ? { opacity: 0.6 } : {}}
              >
                <button onClick={() => toggleDone(task)} className="mt-0.5 shrink-0">
                  {task.status === "done"
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: "#7c3aed" }} />
                    : <Circle className="w-5 h-5 text-slate-300 hover:text-violet-400 transition-colors" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn("text-sm font-semibold text-slate-800", task.status === "done" && "line-through text-slate-400")}>
                      {task.title}
                    </p>
                    <span className="badge text-xs font-medium" style={{ background: p.bg, color: p.text }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 inline-block" style={{ background: p.dot }} />
                      {p.label}
                    </span>
                    <span className="badge" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{task.subject} · {TYPE_LABELS[task.type]}</p>
                  {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">~{formatMinutes(task.estimatedMin)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {task.status !== "done" && (
                    <button
                      onClick={() => updateTask(task.id, { status: task.status === "pending" ? "in_progress" : "pending" })}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ background: "#f1f5f9", color: "#475569" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e2e8f0"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                    >
                      {task.status === "pending" ? "Iniciar" : "Pausar"}
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(task)}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                    style={{ background: "#f1f5f9", color: "#475569" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e2e8f0"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg transition-colors text-slate-300 hover:text-red-400 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#f1f5f9" }}>
              <h2 className="text-base font-semibold text-slate-900">{editId ? "Editar Tarefa" : "Nova Tarefa"}</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título *</label>
                <input className="input" placeholder="Ex: Estudar álgebra linear" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Matéria *</label>
                <input className="input" placeholder="Ex: Matemática" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Prioridade</label>
                  <select className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tipo</label>
                  <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}>
                    <option value="study">Estudo</option>
                    <option value="review">Revisão</option>
                    <option value="practice">Prática</option>
                    <option value="project">Projeto</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Data de Entrega</label>
                  <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tempo Est. (min)</label>
                  <input type="number" min={1} className="input" value={form.estimatedMin} onChange={(e) => setForm({ ...form, estimatedMin: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descrição</label>
                <textarea className="input resize-none" rows={3} placeholder="Detalhes da tarefa..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={!form.title.trim() || !form.subject.trim()} className="btn btn-primary flex-1">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
