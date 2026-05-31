"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Circle, CheckCircle2, Clock,
  ChevronRight, X, Pencil, Check,
} from "lucide-react";
import {
  useStore, Task, SESSION_TYPE_CONFIG,
  GROUP_COLORS, GROUP_EMOJIS,
} from "@/lib/store";
import { Field, ModalHeader, ModalFooter, FormBody } from "@/components/ui";

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fmtDur(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return h === 0 ? `${m}min` : m === 0 ? `${h}h` : `${h}h ${m}min`;
}
function fmtDate(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  const {
    groups, subjects, tasks, sessions, planItems, planDays,
    setActiveGroup, activeGroupId,
    addSubject, deleteSubject,
    updateTask, updateGroup,
  } = useStore();

  const group = groups.find(g => g.id === groupId);

  // Set active group on mount
  useEffect(() => {
    if (group && activeGroupId !== groupId) setActiveGroup(groupId);
  }, [groupId]);

  // â”€â”€ Subject add â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [newSubject, setNewSubject] = useState("");
  const subjectRef = useRef<HTMLInputElement>(null);

  function handleAddSubject() {
    const name = newSubject.trim();
    if (!name) return;
    const exists = subjects.some(s => s.groupId === groupId && s.name.toLowerCase() === name.toLowerCase());
    if (!exists) addSubject(groupId, name);
    setNewSubject("");
    subjectRef.current?.focus();
  }

  // â”€â”€ Edit modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", color: "", emoji: "" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  function openEdit() {
    if (!group) return;
    setEditForm({ name: group.name, description: group.description ?? "", color: group.color, emoji: group.emoji });
    setShowEmojiPicker(false);
    setEditModal(true);
  }

  function handleSaveEdit() {
    if (!editForm.name.trim()) return;
    updateGroup(groupId, editForm);
    setEditModal(false);
  }

  if (!group) {
    return (
      <div style={{ padding: "40px 32px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>Grupo não encontrado.</p>
        <Link href="/groups" style={{ color: "var(--primary)", fontSize: 15 }}>← Voltar para grupos</Link>
      </div>
    );
  }

  // â”€â”€ Derived data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const groupSubjects = subjects.filter(s => s.groupId === groupId);
  const groupTasks    = tasks.filter(t => t.groupId === groupId);
  const pendingTasks  = groupTasks.filter(t => t.status !== "done");
  const doneTasks     = groupTasks.filter(t => t.status === "done");
  const groupSessions = sessions.filter(s => s.groupId === groupId);
  const totalMin      = groupSessions.reduce((acc, s) => acc + (s.actualMin ?? 0), 0);
  const groupPlanItems = planItems.filter(pi => pi.groupId === groupId);

  const subjectData = groupSubjects.map(sub => {
    const subTasks = groupTasks.filter(t => t.subject === sub.name);
    const done = subTasks.filter(t => t.status === "done").length;
    return { sub, total: subTasks.length, done };
  });

  const todayDow = new Date().getDay();
  const orderedWeek = Array.from({ length: 7 }, (_, i) => (todayDow + i) % 7);
  const upcomingDays = orderedWeek
    .map(dow => ({
      dow,
      planDay: planDays.find(pd => pd.dayOfWeek === dow),
      items: groupPlanItems.filter(pi => pi.dayOfWeek === dow).sort((a, b) => a.position - b.position),
    }))
    .filter(d => d.items.length > 0);

  const recentSessions = [...groupSessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const PRIORITY_COLOR = {
    high: { bg: "var(--color-danger-bg)", text: "var(--color-danger-text)", label: "Alta" },
    medium: { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)", label: "Média" },
    low: { bg: "var(--color-success-bg)", text: "var(--color-success-text)", label: "Baixa" },
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div style={{ overflowX: "hidden", maxWidth: "100vw" }}>

      {/* â”€â”€ Hero â”€â”€ */}
      <div className="px-4 pt-5 pb-4 md:px-8 md:pt-7 md:pb-6" style={{ background: `linear-gradient(135deg, ${group.color}e0 0%, ${group.color}70 100%)` }}>
        <Link href="/groups" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 14, textDecoration: "none" }}>
          <ArrowLeft style={{ width: 13, height: 13 }} /> Grupos
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div className="group-detail-emoji" style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
              {group.emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="group-detail-title" style={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: -0.5, lineHeight: 1.1 }}>{group.name}</h1>
              {group.description && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal" }}>{group.description}</p>
              )}
            </div>
          </div>
          <button onClick={openEdit}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 99, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 13, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}>
            <Pencil style={{ width: 12, height: 12 }} /> Editar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 mt-5 md:grid-cols-4 md:gap-x-7 md:gap-y-0">
          {[
            { label: "Matérias", value: groupSubjects.length },
            { label: "Tarefas concluídas", value: `${doneTasks.length}/${groupTasks.length}` },
            { label: "Sessões", value: groupSessions.length },
            { label: "Tempo estudado", value: totalMin > 0 ? fmtDur(totalMin) : "-" },
          ].map(stat => (
            <div key={stat.label}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.68)", marginTop: 3 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Content â”€â”€ */}
      <div className="grid gap-[18px] items-start p-6 md:p-8 grid-cols-1 md:grid-cols-[1fr_320px]">

        {/* â”€â”€ LEFT: SessÃµes + Tarefas â”€â”€ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* SessÃµes */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--text-primary)" }}>Sessões</h2>
              <Link href="/sessions" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 3, flexShrink: 0, whiteSpace: "nowrap" }}>
                Ver <ChevronRight style={{ width: 11, height: 11 }} />
              </Link>
            </div>

            {upcomingDays.length > 0 && (
              <div style={{ padding: "18px", borderBottom: recentSessions.length > 0 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", color: "var(--text-muted)" }}>Planejadas por semana</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>Começando por hoje e seguindo os próximos dias</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: group.color, padding: "4px 9px", borderRadius: 99, background: `${group.color}18`, border: `1px solid ${group.color}35`, flexShrink: 0, whiteSpace: "nowrap" }}>
                    {groupPlanItems.length} {groupPlanItems.length === 1 ? "sessão" : "sessões"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {upcomingDays.map(({ dow, planDay, items }) => (
                    <div key={dow} style={{ padding: 14, borderRadius: 12, background: "var(--surface-subtle)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", flexShrink: 0 }}>{DAY_LABELS[dow]}</p>
                        {dow === todayDow && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: group.color, padding: "2px 6px", borderRadius: 99, background: `${group.color}18`, flexShrink: 0 }}>Hoje</span>
                        )}
                        {planDay && (
                          <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)", marginLeft: "auto", flexShrink: 0 }}>
                            <Clock style={{ width: 11, height: 11 }} /> {fmtDur(planDay.plannedMin)}
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {items.map(item => {
                          const tc = SESSION_TYPE_CONFIG[item.sessionType];
                          return (
                            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
                              <span style={{ width: 4, height: 28, borderRadius: 99, background: group.color, flexShrink: 0 }} />
                              <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${group.color}18`, fontSize: 15, flexShrink: 0 }}>{tc.emoji}</span>
                              <p style={{ fontSize: 15, fontWeight: 650, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.subject}</p>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", padding: "4px 8px", borderRadius: 99, background: "var(--surface-subtle)", border: "1px solid var(--border)", flexShrink: 0 }}>{tc.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {recentSessions.length > 0 ? (
              <div style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>Histórico recente</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {recentSessions.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, background: "var(--surface-subtle)" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                      <p style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.subject}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        {s.actualMin && <span style={{ fontSize: 14, color: "#059669", fontWeight: 600 }}>{fmtDur(s.actualMin)}</span>}
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{fmtDate(s.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              upcomingDays.length === 0 && (
                <div style={{ padding: "28px 18px", textAlign: "center" }}>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>Nenhuma sessão registrada ainda</p>
                  <Link href="/sessions" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}>Planejar sessões →</Link>
                </div>
              )
            )}
          </div>

          {/* Tarefas */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, overflow: "hidden" }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)" }}>Tarefas pendentes</h2>
              <Link href="/tasks" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Ver todas <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <div style={{ padding: "28px 18px", textAlign: "center" }}>
                <CheckCircle2 style={{ width: 28, height: 28, color: "var(--text-muted)", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 15, color: "var(--text-muted)" }}>Tudo em dia! Nenhuma tarefa pendente.</p>
              </div>
            ) : (
              pendingTasks.slice(0, 6).map((task, idx, arr) => {
                const pc = PRIORITY_COLOR[task.priority];
                return (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <button
                      onClick={() => updateTask(task.id, { status: "done" })}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, display: "flex", color: "var(--text-muted)" }}>
                      <Circle style={{ width: 20, height: 20 }} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{task.subject}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {task.estimatedMin > 0 && (
                        <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock style={{ width: 11, height: 11 }} />{fmtDur(task.estimatedMin)}
                        </span>
                      )}
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: pc.bg, color: pc.text }}>
                        {pc.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)" }}>
              <Link href="/tasks" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Plus style={{ width: 13, height: 13 }} /> Nova tarefa
              </Link>
            </div>
          </div>
        </div>

        {/* â”€â”€ RIGHT: MatÃ©rias â”€â”€ */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)" }}>
              Matérias <span style={{ fontWeight: 400, color: "var(--text-muted)", letterSpacing: 0, textTransform: "none", fontSize: 13 }}>· {groupSubjects.length}</span>
            </h2>
          </div>

          {subjectData.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "var(--text-muted)" }}>Nenhuma matéria ainda</p>
            </div>
          ) : (
            <div>
              {subjectData.map(({ sub, total, done }, idx) => (
                <div key={sub.id} style={{ padding: "13px 18px", borderBottom: idx < subjectData.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: total > 0 ? 8 : 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                    <p style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.name}
                    </p>
                    {total > 0 && (
                      <span style={{ fontSize: 13, color: done === total ? "#059669" : "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>
                        {done}/{total}
                      </span>
                    )}
                    <button onClick={() => deleteSubject(sub.id)}
                      style={{ padding: 2, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", opacity: 0.45, flexShrink: 0 }}>
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                  {total > 0 && (
                    <div style={{ marginLeft: 17, height: 3, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round((done / total) * 100)}%`, background: done === total ? "#059669" : group.color, borderRadius: 99, transition: "width 0.3s" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              ref={subjectRef}
              className="input"
              style={{ flex: 1, fontSize: 14, padding: "8px 12px" }}
              placeholder="Nova matéria..."
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddSubject(); }}
            />
            <button
              onClick={handleAddSubject}
              disabled={!newSubject.trim()}
              style={{ padding: "8px 12px", borderRadius: 11, border: "none", cursor: "pointer", background: `${group.color}20`, color: group.color, display: "flex", alignItems: "center", opacity: !newSubject.trim() ? 0.4 : 1 }}>
              <Plus style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </div>

      {/* â”€â”€ Edit modal â”€â”€ */}
      {editModal && (
        <div className="modal-overlay" onClick={() => { setEditModal(false); setShowEmojiPicker(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <ModalHeader title="Editar grupo" onClose={() => setEditModal(false)} />

            <FormBody>
              {/* Emoji + Name row */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ position: "relative", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setShowEmojiPicker(p => !p)}
                    style={{ width: 56, height: 56, borderRadius: 11, border: `1.5px solid ${showEmojiPicker ? editForm.color : "var(--border)"}`, background: showEmojiPicker ? `${editForm.color}12` : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, cursor: "pointer" }}>
                    {editForm.emoji}
                  </button>
                  {showEmojiPicker && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowEmojiPicker(false)} />
                      <div style={{ position: "absolute", top: 62, left: 0, zIndex: 100, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 10, boxShadow: "var(--shadow-lg)", display: "grid", gridTemplateColumns: "repeat(5, 36px)", gap: 4 }}>
                        {GROUP_EMOJIS.map(e => (
                          <button key={e} onClick={() => { setEditForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false); }}
                            style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: editForm.emoji === e ? `${editForm.color}20` : "transparent", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", outline: editForm.emoji === e ? `2px solid ${editForm.color}` : "none" }}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ flex: 1 }} onClick={() => setShowEmojiPicker(false)}>
                  <Field label="Nome do grupo">
                    <input className="input" type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  </Field>
                </div>
              </div>

              <Field label="Descrição (opcional)">
                <input className="input" type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </Field>

              <div>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Cor</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {GROUP_COLORS.map(({ value, label }) => (
                    <button key={value} title={label} onClick={() => setEditForm(f => ({ ...f, color: value }))}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer", background: value, transform: editForm.color === value ? "scale(1.2)" : "scale(1)", boxShadow: editForm.color === value ? `0 0 0 3px ${value}40, 0 0 0 5px var(--surface)` : "none", transition: "all 0.15s" }} />
                  ))}
                </div>
              </div>
            </FormBody>

            <ModalFooter onCancel={() => setEditModal(false)} onConfirm={handleSaveEdit} confirmDisabled={!editForm.name.trim()} confirmLabel="Salvar alterações" />
          </div>
        </div>
      )}
    </div>
  );
}
