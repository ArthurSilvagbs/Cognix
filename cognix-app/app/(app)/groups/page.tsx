"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, ArrowRight, FolderOpen, CheckSquare, Code2, BookOpen, X, Smile } from "lucide-react";
import { useStore, StudyGroup, GROUP_COLORS, GROUP_EMOJIS } from "@/lib/store";
import { Field, ModalHeader, ModalFooter, FormBody } from "@/components/ui";

interface FormData { name: string; description: string; color: string; emoji: string; }
const EMPTY: FormData = { name: "", description: "", color: "#7c3aed", emoji: "📚" };

export default function GroupsPage() {
  const { groups, tasks, exercises, subjects, addGroup, updateGroup, deleteGroup, setActiveGroup, addSubject, deleteSubject } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newSubjectInput, setNewSubjectInput] = useState<Record<string, string>>({});
  const subjectInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function openNew() { setForm(EMPTY); setEditId(null); setShowEmojiPicker(false); setShowModal(true); }
  function openEdit(g: StudyGroup) {
    setForm({ name: g.name, description: g.description ?? "", color: g.color, emoji: g.emoji });
    setEditId(g.id); setShowEmojiPicker(false); setShowModal(true);
  }
  function handleSave() {
    if (!form.name.trim()) return;
    editId ? updateGroup(editId, form) : addGroup(form);
    setShowModal(false); setForm(EMPTY); setEditId(null);
  }

  function groupStats(id: string) {
    return {
      tasks: tasks.filter((t) => t.groupId === id).length,
      exercises: exercises.filter((e) => e.groupId === id).length,
    };
  }

  function handleAddSubject(groupId: string) {
    const name = (newSubjectInput[groupId] ?? "").trim();
    if (!name) return;
    const alreadyExists = subjects.some((s) => s.groupId === groupId && s.name.toLowerCase() === name.toLowerCase());
    if (alreadyExists) return;
    addSubject(groupId, name);
    setNewSubjectInput((prev) => ({ ...prev, [groupId]: "" }));
    subjectInputRefs.current[groupId]?.focus();
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--surface-subtle)" }}>
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
            const groupSubjects = subjects.filter((sub) => sub.groupId === g.id);

            return (
              <div key={g.id} className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Colored top bar */}
                <div style={{ height: 4, background: g.color, opacity: 0.85 }} />

                <div style={{ padding: "18px 18px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${g.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {g.emoji}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {g.name}
                        </p>
                        {g.description && (
                          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {g.description}
                          </p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckSquare style={{ width: 11, height: 11 }} />
                            {s.tasks} tarefa{s.tasks !== 1 ? "s" : ""}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Code2 style={{ width: 11, height: 11 }} />
                            {s.exercises} exercício{s.exercises !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      <button onClick={() => openEdit(g)} style={{ padding: 6, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                        <Pencil style={{ width: 14, height: 14 }} />
                      </button>
                      {deleteConfirm === g.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button onClick={() => { deleteGroup(g.id); setDeleteConfirm(null); }}
                            style={{ fontSize: 11, padding: "4px 8px", borderRadius: 7, border: "none", cursor: "pointer", background: "var(--color-danger-bg)", color: "var(--color-danger-text)", fontWeight: 500 }}>
                            Confirmar
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            style={{ fontSize: 11, padding: "4px 8px", borderRadius: 7, border: "none", cursor: "pointer", background: "var(--surface-subtle)", color: "var(--text-muted)" }}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(g.id)} style={{ padding: 6, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subjects */}
                  <div style={{ flex: 1, marginBottom: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                      Matérias
                    </p>

                    {groupSubjects.length === 0 && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 8 }}>
                        Nenhuma matéria adicionada
                      </p>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: groupSubjects.length > 0 ? 8 : 0 }}>
                      {groupSubjects.map((sub) => (
                        <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: "var(--surface-subtle)" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sub.name}
                          </span>
                          <button onClick={() => deleteSubject(sub.id)}
                            style={{ padding: 2, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", flexShrink: 0, opacity: 0.6 }}>
                            <X style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add subject */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        ref={(el) => { subjectInputRefs.current[g.id] = el; }}
                        className="input"
                        style={{ flex: 1, fontSize: 13, padding: "8px 12px" }}
                        placeholder="Adicionar matéria..."
                        value={newSubjectInput[g.id] ?? ""}
                        onChange={(e) => setNewSubjectInput((prev) => ({ ...prev, [g.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddSubject(g.id); }}
                      />
                      <button
                        onClick={() => handleAddSubject(g.id)}
                        disabled={!(newSubjectInput[g.id] ?? "").trim()}
                        style={{ padding: "8px 12px", borderRadius: 11, border: "none", cursor: "pointer", background: `${g.color}20`, color: g.color, display: "flex", alignItems: "center", opacity: !(newSubjectInput[g.id] ?? "").trim() ? 0.4 : 1 }}
                      >
                        <Plus style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    href={`/groups/${g.id}`}
                    onClick={() => setActiveGroup(g.id)}
                    className="btn"
                    style={{ background: g.color, color: "white", width: "100%", fontSize: 14 }}
                  >
                    Entrar no grupo <ArrowRight style={{ width: 15, height: 15 }} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setShowEmojiPicker(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <ModalHeader
              title={editId ? "Editar grupo" : "Novo grupo"}
              onClose={() => setShowModal(false)}
            />

            <FormBody>
              {/* Emoji button + Name row */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                {/* Emoji trigger button + popover */}
                <div style={{ position: "relative", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(p => !p)}
                    title="Escolher ícone"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 11,
                      border: `1.5px solid ${showEmojiPicker ? form.color : "var(--border)"}`,
                      background: showEmojiPicker ? `${form.color}12` : "var(--surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {form.emoji}
                  </button>

                  {showEmojiPicker && (
                    <>
                      {/* invisible backdrop — closes picker on outside click */}
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 99 }}
                        onClick={() => setShowEmojiPicker(false)}
                      />
                    <div
                      style={{
                        position: "absolute",
                        top: 62,
                        left: 0,
                        zIndex: 100,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: 10,
                        boxShadow: "var(--shadow-lg)",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 36px)",
                        gap: 4,
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {GROUP_EMOJIS.map(e => (
                        <button
                          key={e}
                          onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false); }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            border: "none",
                            background: form.emoji === e ? `${form.color}20` : "transparent",
                            cursor: "pointer",
                            fontSize: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            outline: form.emoji === e ? `2px solid ${form.color}` : "none",
                            transition: "background 0.1s",
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                    </>
                  )}
                </div>

                <div style={{ flex: 1 }} onClick={e => { e.stopPropagation(); setShowEmojiPicker(false); }}>
                  <Field label="Nome do grupo">
                    <input className="input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                  </Field>
                </div>
              </div>

              <Field label="Descrição (opcional)">
                <input className="input" type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Field>

              {/* Color picker */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Cor</p>
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
                        boxShadow: form.color === value ? `0 0 0 3px ${value}40, 0 0 0 5px var(--surface)` : "none",
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
            </FormBody>

            <ModalFooter
              onCancel={() => setShowModal(false)}
              onConfirm={handleSave}
              confirmDisabled={!form.name.trim()}
              confirmLabel={editId ? "Salvar alterações" : "Criar grupo"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
