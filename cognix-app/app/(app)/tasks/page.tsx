"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Clock, SlidersHorizontal } from "lucide-react";
import { useStore, useGroupData, Task, TaskPriority, TaskStatus, TaskType } from "@/lib/store";
import { cn, formatMinutes } from "@/lib/utils";
import { Field, SelectField, StaticField, ModalHeader, ModalFooter, FormBody } from "@/components/ui";

type FilterTab = "all" | "pending" | "in_progress" | "done";

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; dot: string; label: string }> = {
  low:    { bg: "var(--color-success-bg)", text: "var(--color-success-text)", dot: "#22c55e", label: "Baixa"  },
  medium: { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)", dot: "#f59e0b", label: "Média"  },
  high:   { bg: "var(--color-danger-bg)",  text: "var(--color-danger-text)",  dot: "#ef4444", label: "Alta"   },
};
const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  pending:     { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)", label: "Pendente"     },
  in_progress: { bg: "var(--color-info-bg)",    text: "var(--color-info-text)",    label: "Em Andamento" },
  done:        { bg: "var(--color-success-bg)", text: "var(--color-success-text)", label: "Concluída"    },
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
  const { addTask, updateTask, deleteTask } = useStore();
  const { tasks, activeGroupId } = useGroupData();

  const [tab, setTab] = useState<FilterTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const { groups, subjects } = useStore();
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const formGroupId = activeGroupId ?? (editId ? groups.find((g) => tasks.find((t) => t.id === editId)?.groupId === g.id)?.id ?? "" : "");
  const formSubjects = subjects.filter((s) => s.groupId === (activeGroupId ?? formGroupId));

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
    editId ? updateTask(editId, form) : addTask({ ...form, status: "pending", groupId: activeGroupId });
    setShowModal(false); setForm(EMPTY); setEditId(null);
  }
  function toggleDone(task: Task) {
    updateTask(task.id, task.status === "done" ? { status: "pending", completedAt: undefined } : { status: "done" });
  }

  return (
    <div className="tasks-wrap p-7 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tarefas de Estudo</h1>
            {activeGroup && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${activeGroup.color}15`, color: activeGroup.color }}>
                {activeGroup.emoji} {activeGroup.name}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-slate-600 font-medium">{pending}</span> pendente{pending !== 1 ? "s" : ""} · <span className="text-slate-600 font-medium">{done}</span> concluída{done !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "var(--surface-subtle)" }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all duration-150"
            style={tab === key ? { background: "var(--surface)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgb(0 0 0 / 0.15)" } : { background: "transparent", color: "var(--text-muted)" }}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--surface-subtle)" }}>
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
              <div key={task.id} className="card flex items-start gap-3 px-4 py-3.5 hover:shadow-sm transition-all duration-150" style={task.status === "done" ? { opacity: 0.6 } : {}}>
                <button onClick={() => toggleDone(task)} className="mt-0.5 shrink-0">
                  {task.status === "done"
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: "var(--primary-subtle-text)" }} />
                    : <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn("text-sm font-semibold text-slate-800", task.status === "done" && "line-through text-slate-400")}>{task.title}</p>
                    <span className="badge" style={{ background: p.bg, color: p.text }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: p.dot }} />{p.label}
                    </span>
                    <span className="badge" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{task.subject} · {TYPE_LABELS[task.type]}</p>
                  {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />{new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">~{formatMinutes(task.estimatedMin)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {task.status !== "done" && (
                    <button onClick={() => updateTask(task.id, { status: task.status === "pending" ? "in_progress" : "pending" })}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ background: "var(--surface-subtle)", color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--border)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-subtle)"; }}>
                      {task.status === "pending" ? "Iniciar" : "Pausar"}
                    </button>
                  )}
                  <button onClick={() => openEdit(task)} className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                    style={{ background: "var(--surface-subtle)", color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--border)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-subtle)"; }}>
                    Editar
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg transition-colors text-slate-300 hover:text-red-400 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <ModalHeader
              title={editId ? "Editar tarefa" : "Nova tarefa"}
              subtitle={activeGroup && !editId ? `em ${activeGroup.emoji} ${activeGroup.name}` : undefined}
              onClose={() => setShowModal(false)}
            />
            <FormBody>
              <Field label="Título">
                <input className="input" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
              </Field>
              {!activeGroupId && !editId && (
                <SelectField label="Grupo" value={formGroupId} onChange={v => setForm({ ...form, subject: "" })}>
                  <option value="">Selecione um grupo</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
                </SelectField>
              )}
              {formSubjects.length > 0 ? (
                <SelectField label="Matéria" value={form.subject} onChange={v => setForm({ ...form, subject: v })}>
                  <option value="">Selecione a matéria</option>
                  {formSubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </SelectField>
              ) : (
                <Field label="Matéria">
                  <input className="input" type="text" placeholder="Ex: Matemática" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </Field>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <SelectField label="Prioridade" value={form.priority} onChange={v => setForm({ ...form, priority: v as TaskPriority })}>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </SelectField>
                <SelectField label="Tipo" value={form.type} onChange={v => setForm({ ...form, type: v as TaskType })}>
                  <option value="study">Estudo</option>
                  <option value="review">Revisão</option>
                  <option value="practice">Prática</option>
                  <option value="project">Projeto</option>
                </SelectField>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <StaticField label="Prazo">
                  <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </StaticField>
                <StaticField label="Tempo estimado (min)">
                  <input className="input" type="number" min={1} value={form.estimatedMin} onChange={e => setForm({ ...form, estimatedMin: Number(e.target.value) })} />
                </StaticField>
              </div>
              <Field label="Descrição (opcional)">
                <textarea className="input" style={{ resize: "none" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Field>
            </FormBody>
            <ModalFooter
              onCancel={() => setShowModal(false)}
              onConfirm={handleSave}
              confirmDisabled={!form.title.trim() || !form.subject.trim()}
              confirmLabel={editId ? "Salvar alterações" : "Criar tarefa"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
