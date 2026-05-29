"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, ArrowRight, FolderOpen, CheckSquare, BookOpen, Code2 } from "lucide-react";
import { useStore, StudyGroup, GROUP_COLORS, GROUP_EMOJIS } from "@/lib/store";

interface FormData { name: string; description: string; color: string; emoji: string; }
const EMPTY: FormData = { name: "", description: "", color: "#7c3aed", emoji: "📚" };

export default function GroupsPage() {
  const { groups, tasks, sessions, exercises, addGroup, updateGroup, deleteGroup, setActiveGroup } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openNew() { setForm(EMPTY); setEditId(null); setShowModal(true); }
  function openEdit(g: StudyGroup) {
    setForm({ name: g.name, description: g.description ?? "", color: g.color, emoji: g.emoji });
    setEditId(g.id); setShowModal(true);
  }
  function handleSave() {
    if (!form.name.trim()) return;
    editId ? updateGroup(editId, form) : addGroup(form);
    setShowModal(false); setForm(EMPTY); setEditId(null);
  }

  function groupStats(id: string) {
    return {
      tasks: tasks.filter((t) => t.groupId === id).length,
      sessions: sessions.filter((s) => s.groupId === id).length,
      exercises: exercises.filter((e) => e.groupId === id).length,
      totalMin: sessions.filter((s) => s.groupId === id).reduce((a, s) => a + s.durationMin, 0),
    };
  }

  function handleGoToGroup(id: string) {
    setActiveGroup(id);
  }

  return (
    <div className="p-7 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Grupos de Estudo</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Organize seus estudos por áreas, matérias ou objetivos
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Novo Grupo
        </button>
      </div>

      {/* Empty */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#f1f5f9" }}>
            <FolderOpen className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 text-base">Nenhum grupo criado</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Crie grupos para separar seus estudos por área — programação, ENEM, concursos, idiomas...
          </p>
          <button onClick={openNew} className="btn btn-primary mt-5">
            <Plus className="w-4 h-4" /> Criar primeiro grupo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {groups.map((g) => {
            const s = groupStats(g.id);
            const totalH = Math.floor(s.totalMin / 60);
            const totalM = s.totalMin % 60;
            return (
              <div
                key={g.id}
                className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Group header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: `${g.color}18` }}
                    >
                      {g.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 leading-tight">{g.name}</p>
                      {g.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{g.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(g)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirm === g.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { deleteGroup(g.id); setDeleteConfirm(null); }}
                          className="text-xs px-2 py-1 rounded-lg font-medium transition-colors"
                          style={{ background: "#fef2f2", color: "#dc2626" }}
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs px-2 py-1 rounded-lg font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(g.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { icon: CheckSquare, label: "Tarefas", value: s.tasks },
                    { icon: BookOpen, label: "Sessões", value: s.sessions },
                    { icon: Code2, label: "Exercícios", value: s.exercises },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "#f8fafc" }}>
                      <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" />
                      <p className="text-base font-bold text-slate-700">{value}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>

                {s.totalMin > 0 && (
                  <p className="text-xs text-slate-400 mb-3">
                    ⏱️ <span className="font-medium text-slate-600">{totalH}h {totalM}m</span> estudadas neste grupo
                  </p>
                )}

                {/* Color bar */}
                <div className="h-1 rounded-full mb-4" style={{ background: `${g.color}30` }}>
                  <div className="h-full rounded-full" style={{ width: "100%", background: g.color, opacity: 0.6 }} />
                </div>

                {/* Action */}
                <Link
                  href="/dashboard"
                  onClick={() => handleGoToGroup(g.id)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: `${g.color}15`, color: g.color, border: `1px solid ${g.color}25` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${g.color}25`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${g.color}15`; }}
                >
                  Entrar no grupo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <h2 className="text-base font-semibold text-slate-900">{editId ? "Editar Grupo" : "Novo Grupo"}</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Emoji picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {GROUP_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                      style={form.emoji === e
                        ? { background: `${form.color}20`, border: `2px solid ${form.color}`, transform: "scale(1.1)" }
                        : { background: "#f8fafc", border: "2px solid transparent" }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nome *</label>
                <input
                  className="input"
                  placeholder="Ex: ENEM 2025, Programação, Concurso Banco"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descrição <span className="font-normal text-slate-400">(opcional)</span></label>
                <input
                  className="input"
                  placeholder="Ex: Preparação para o ENEM 2025"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {GROUP_COLORS.map(({ value, label }) => (
                    <button
                      key={value}
                      title={label}
                      onClick={() => setForm({ ...form, color: value })}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: value,
                        transform: form.color === value ? "scale(1.2)" : "scale(1)",
                        boxShadow: form.color === value ? `0 0 0 3px ${value}40, 0 0 0 5px white` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: `${form.color}12`, border: `1.5px solid ${form.color}30` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${form.color}20` }}>
                  {form.emoji}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: form.color }}>{form.name || "Nome do grupo"}</p>
                  <p className="text-xs text-slate-400">{form.description || "Descrição do grupo"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="btn btn-primary flex-1">
                {editId ? "Salvar alterações" : "Criar grupo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
