"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { useStore, Task, TaskPriority, TaskStatus, TaskType } from "@/lib/store";
import { cn, formatMinutes, generateId } from "@/lib/utils";

type FilterTab = "all" | "pending" | "in_progress" | "done";

const PRIORITY_LABEL: Record<TaskPriority, string> = { low: "Baixa", medium: "Média", high: "Alta" };
const TYPE_LABEL: Record<TaskType, string> = { study: "Estudo", review: "Revisão", practice: "Prática", project: "Projeto" };

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  done: "Concluída",
};

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendentes" },
  { key: "in_progress", label: "Em Andamento" },
  { key: "done", label: "Concluídas" },
];

interface FormData {
  title: string;
  subject: string;
  priority: TaskPriority;
  type: TaskType;
  dueDate: string;
  estimatedMin: number;
  description: string;
}

const emptyForm: FormData = {
  title: "",
  subject: "",
  priority: "medium",
  type: "study",
  dueDate: "",
  estimatedMin: 60,
  description: "",
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  const [tab, setTab] = useState<FilterTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = tasks.filter((t) => {
    if (tab === "all") return true;
    return t.status === tab;
  });

  const done = tasks.filter((t) => t.status === "done").length;
  const pending = tasks.filter((t) => t.status !== "done").length;

  function openNew() {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      type: task.type,
      dueDate: task.dueDate ?? "",
      estimatedMin: task.estimatedMin,
      description: task.description ?? "",
    });
    setEditId(task.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!form.title.trim() || !form.subject.trim()) return;
    if (editId) {
      updateTask(editId, form);
    } else {
      addTask({ ...form, status: "pending" });
    }
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  }

  function toggleStatus(task: Task) {
    if (task.status === "done") {
      updateTask(task.id, { status: "pending", completedAt: undefined });
    } else {
      updateTask(task.id, { status: "done" });
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas de Estudo</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pending} pendente{pending !== 1 ? "s" : ""} · {done} concluída{done !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "text-sm px-4 py-1.5 rounded-full font-medium transition-colors",
              tab === key ? "bg-purple-700 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
          <p className="font-medium text-gray-500">Nenhuma tarefa encontrada</p>
          <p className="text-sm mt-1">Clique em "Nova Tarefa" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={cn(
                "bg-white border rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-all",
                task.status === "done" ? "border-gray-100 opacity-75" : "border-gray-200"
              )}
            >
              <button onClick={() => toggleStatus(task)} className="mt-0.5 shrink-0">
                {task.status === "done" ? (
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-purple-400 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn("font-semibold text-gray-800 text-sm", task.status === "done" && "line-through text-gray-400")}>
                    {task.title}
                  </p>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", PRIORITY_COLOR[task.priority])}>
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_COLOR[task.status])}>
                    {STATUS_LABEL[task.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{task.subject} · {TYPE_LABEL[task.type]}</p>
                {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">~{formatMinutes(task.estimatedMin)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {task.status !== "done" && (
                  <button
                    onClick={() => updateTask(task.id, { status: task.status === "pending" ? "in_progress" : "pending" })}
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {task.status === "pending" ? "Iniciar" : "Pausar"}
                  </button>
                )}
                <button
                  onClick={() => openEdit(task)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-bold text-gray-900">{editId ? "Editar Tarefa" : "Nova Tarefa"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors"
                  placeholder="Ex: Estudar álgebra linear"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors"
                  placeholder="Ex: Matemática"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 bg-white transition-colors"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 bg-white transition-colors"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}
                  >
                    <option value="study">Estudo</option>
                    <option value="review">Revisão</option>
                    <option value="practice">Prática</option>
                    <option value="project">Projeto</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Estimado (min)</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
                    value={form.estimatedMin}
                    onChange={(e) => setForm({ ...form, estimatedMin: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-colors"
                  rows={3}
                  placeholder="Detalhes da tarefa..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim() || !form.subject.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
