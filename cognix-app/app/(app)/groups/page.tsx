"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckSquare, Code2, FolderOpen, Pencil, Plus, Trash2, X,
} from "lucide-react";
import { Field, FormBody, ModalFooter, ModalHeader } from "@/components/ui";
import { GROUP_COLORS, GROUP_EMOJIS, StudyGroup, useStore } from "@/lib/store";

interface FormData {
  name: string;
  description: string;
  color: string;
  emoji: string;
}

const EMPTY: FormData = { name: "", description: "", color: "#2563eb", emoji: "📚" };

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 850, color: "var(--text-primary)", lineHeight: 1.1 }}> {title}</h1>
        {subtitle && <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 6 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default function GroupsPage() {
  const {
    groups, tasks, exercises, subjects,
    addGroup, updateGroup, deleteGroup, setActiveGroup, addSubject, deleteSubject,
  } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newSubjectInput, setNewSubjectInput] = useState<Record<string, string>>({});
  const subjectInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function openNew() {
    setForm(EMPTY);
    setEditId(null);
    setShowEmojiPicker(false);
    setShowModal(true);
  }

  function openEdit(group: StudyGroup) {
    setForm({ name: group.name, description: group.description ?? "", color: group.color, emoji: group.emoji });
    setEditId(group.id);
    setShowEmojiPicker(false);
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    editId ? updateGroup(editId, form) : addGroup(form);
    setShowModal(false);
    setForm(EMPTY);
    setEditId(null);
  }

  function handleAddSubject(groupId: string) {
    const name = (newSubjectInput[groupId] ?? "").trim();
    if (!name) return;
    const alreadyExists = subjects.some((subject) => subject.groupId === groupId && subject.name.toLowerCase() === name.toLowerCase());
    if (alreadyExists) return;
    addSubject(groupId, name);
    setNewSubjectInput((prev) => ({ ...prev, [groupId]: "" }));
    subjectInputRefs.current[groupId]?.focus();
  }

  return (
    <div className="groups-grid" style={{ padding: 32, maxWidth: 1280, margin: "0 auto" }}>
      <SectionHeader
        title="Grupos de Estudo"
        subtitle="Organize seus estudos por áreas, matérias ou objetivos."
        action={(
          <button onClick={openNew} className="btn btn-primary">
            <Plus style={{ width: 17, height: 17 }} /> Novo grupo
          </button>
        )}
      />

      {groups.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "52px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, margin: "0 auto 14px", background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderOpen style={{ width: 26, height: 26, color: "var(--text-muted)" }} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 750, color: "var(--text-primary)" }}>Nenhum grupo criado</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 5 }}>Crie um grupo para separar seus estudos por contexto.</p>
          <button onClick={openNew} className="btn btn-primary" style={{ marginTop: 18 }}>
            <Plus style={{ width: 17, height: 17 }} /> Criar primeiro grupo
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          {groups.map((group) => {
            const groupSubjects = subjects.filter((subject) => subject.groupId === group.id);
            const groupTasks = tasks.filter((task) => task.groupId === group.id);
            const groupExercises = exercises.filter((exercise) => exercise.groupId === group.id);
            const doneTasks = groupTasks.filter((task) => task.status === "done").length;

            return (
              <section key={group.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 5, background: group.color }} />
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                    <div style={{ display: "flex", gap: 13, minWidth: 0 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 15, background: `${group.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {group.emoji}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.name}</h2>
                        {group.description && (
                          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.description}</p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => openEdit(group)} title="Editar" style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Pencil style={{ width: 15, height: 15 }} />
                      </button>
                      {deleteConfirm === group.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <button onClick={() => { deleteGroup(group.id); setDeleteConfirm(null); }} style={{ fontSize: 12, padding: "5px 8px", borderRadius: 8, border: "none", cursor: "pointer", background: "var(--color-danger-bg)", color: "var(--color-danger-text)", fontWeight: 650 }}>
                            Confirmar
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: 12, padding: "5px 8px", borderRadius: 8, border: "none", cursor: "pointer", background: "var(--surface-subtle)", color: "var(--text-muted)" }}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(group.id)} title="Excluir" style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 style={{ width: 15, height: 15 }} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 9 }}>
                    {[
                      { label: "Matérias", value: groupSubjects.length, icon: FolderOpen },
                      { label: "Tarefas", value: `${doneTasks}/${groupTasks.length}`, icon: CheckSquare },
                      { label: "Exercícios", value: groupExercises.length, icon: Code2 },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} style={{ padding: "10px 11px", borderRadius: 12, background: "var(--surface-subtle)", border: "1px solid var(--border)" }}>
                        <Icon style={{ width: 15, height: 15, color: "var(--text-muted)", marginBottom: 8 }} />
                        <p style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 750, letterSpacing: 0.7, textTransform: "uppercase", color: "var(--text-muted)" }}>Matérias</p>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{groupSubjects.length}</span>
                    </div>

                    {groupSubjects.length === 0 ? (
                      <p style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 10 }}>Nenhuma matéria adicionada</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                        {groupSubjects.slice(0, 6).map((subject) => (
                          <div key={subject.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, background: "var(--surface-subtle)", border: "1px solid var(--border)" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 14, fontWeight: 650, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subject.name}</span>
                            <button onClick={() => deleteSubject(subject.id)} style={{ padding: 2, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", opacity: 0.55 }}>
                              <X style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        ref={(el) => { subjectInputRefs.current[group.id] = el; }}
                        className="input"
                        style={{ flex: 1, fontSize: 14, padding: "9px 12px", height: 42 }}
                        placeholder="Adicionar matéria..."
                        value={newSubjectInput[group.id] ?? ""}
                        onChange={(e) => setNewSubjectInput((prev) => ({ ...prev, [group.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddSubject(group.id); }}
                      />
                      <button onClick={() => handleAddSubject(group.id)} disabled={!(newSubjectInput[group.id] ?? "").trim()} style={{ width: 42, borderRadius: 12, border: "none", cursor: "pointer", background: `${group.color}18`, color: group.color, display: "flex", alignItems: "center", justifyContent: "center", opacity: !(newSubjectInput[group.id] ?? "").trim() ? 0.45 : 1 }}>
                        <Plus style={{ width: 17, height: 17 }} />
                      </button>
                    </div>
                  </div>

                  <Link href={`/groups/${group.id}`} onClick={() => setActiveGroup(group.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, background: `${group.color}18`, border: `1px solid ${group.color}35`, color: "var(--text-primary)", textDecoration: "none", fontSize: 15, fontWeight: 750 }}>
                    Entrar no grupo <ArrowRight style={{ width: 16, height: 16, color: group.color }} />
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setShowEmojiPicker(false); }}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <ModalHeader title={editId ? "Editar grupo" : "Novo grupo"} onClose={() => setShowModal(false)} />

            <FormBody>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ position: "relative", flexShrink: 0 }} onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((open) => !open)}
                    title="Escolher ícone"
                    style={{ width: 56, height: 56, borderRadius: 11, border: `1.5px solid ${showEmojiPicker ? form.color : "var(--border)"}`, background: showEmojiPicker ? `${form.color}12` : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer", transition: "all 0.15s" }}
                  >
                    {form.emoji}
                  </button>

                  {showEmojiPicker && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowEmojiPicker(false)} />
                      <div style={{ position: "absolute", top: 62, left: 0, zIndex: 100, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 10, boxShadow: "var(--shadow-lg)", display: "grid", gridTemplateColumns: "repeat(5, 36px)", gap: 4 }} onClick={(event) => event.stopPropagation()}>
                        {GROUP_EMOJIS.map((emoji) => (
                          <button key={emoji} onClick={() => { setForm((current) => ({ ...current, emoji })); setShowEmojiPicker(false); }} style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: form.emoji === emoji ? `${form.color}20` : "transparent", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", outline: form.emoji === emoji ? `2px solid ${form.color}` : "none", transition: "background 0.1s" }}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div style={{ flex: 1 }} onClick={(event) => { event.stopPropagation(); setShowEmojiPicker(false); }}>
                  <Field label="Nome do grupo">
                    <input className="input" type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoFocus />
                  </Field>
                </div>
              </div>

              <Field label="Descrição (opcional)">
                <input className="input" type="text" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </Field>

              <div>
                <p style={{ fontSize: 12, fontWeight: 650, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Cor</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {GROUP_COLORS.map(({ value, label }) => (
                    <button key={value} title={label} onClick={() => setForm({ ...form, color: value })} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: value, cursor: "pointer", transform: form.color === value ? "scale(1.18)" : "scale(1)", boxShadow: form.color === value ? `0 0 0 3px ${value}40, 0 0 0 5px var(--surface)` : "none", transition: "all 0.12s" }} />
                  ))}
                </div>
              </div>

              <div style={{ borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12, background: `${form.color}12`, border: `1.5px solid ${form.color}30` }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, background: `${form.color}20` }}>
                  {form.emoji}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 750, color: "var(--text-primary)" }}>{form.name || "Nome do grupo"}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{form.description || "Descrição do grupo"}</p>
                </div>
              </div>
            </FormBody>

            <ModalFooter onCancel={() => setShowModal(false)} onConfirm={handleSave} confirmDisabled={!form.name.trim()} confirmLabel={editId ? "Salvar alterações" : "Criar grupo"} />
          </div>
        </div>
      )}
    </div>
  );
}
