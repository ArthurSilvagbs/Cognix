"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Check, Settings2,
  Clock, Trash2, FileText, X, ChevronDown,
} from "lucide-react";
import { useStore, StudyPlanItem, SessionType, SESSION_TYPE_CONFIG } from "@/lib/store";
import { Field, SelectField, ModalHeader, ModalFooter, FormBody } from "@/components/ui";

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDateStr(d: Date) { return d.toISOString().split("T")[0]; }
function parseLocal(s: string) { return new Date(s + "T12:00:00"); }
function getDow(s: string) { return parseLocal(s).getDay(); }
function formatDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return h === 0 ? `${m}min` : m === 0 ? `${h}h` : `${h}h ${m}min`;
}
function buildGrid(year: number, month: number): (string | null)[] {
  const total = new Date(year, month + 1, 0).getDate();
  const offset = (() => { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; })();
  const grid: (string | null)[] = new Array(offset).fill(null);
  for (let d = 1; d <= total; d++) grid.push(toDateStr(new Date(year, month, d)));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAY_ABBR = ["S","T","Q","Q","S","S","D"];
const DAY_FULL = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const DAY_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const SESSION_TYPES: SessionType[] = ["content","review","exercises","simulado"];
const WEEK_ORDER = [1,2,3,4,5,6,0];

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  iconBtn: { padding: "5px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" } as React.CSSProperties,
  label: { fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, color: "var(--text-muted)" },
  closeBtn: { width: 26, height: 26, borderRadius: 7, border: "none", background: "var(--surface-subtle)", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, lineHeight: 1 } as React.CSSProperties,
};

export default function SessionsPage() {
  const { groups, subjects, planDays, planItems, sessions, activeGroupId, savePlan, savePlanItems, addSession, deleteSession } = useStore();
  const today = toDateStr(new Date());

  // ── Calendar state ────────────────────────────────────────────────────────
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selected, setSelected] = useState(today);
  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  function prevMonth() { viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1); }
  function nextMonth() { viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1); }

  // ── Selected day ──────────────────────────────────────────────────────────
  const selDow = getDow(selected);
  const selPlanDay = planDays.find(p => p.dayOfWeek === selDow);
  const selItems = useMemo(() =>
    planItems.filter(pi => pi.dayOfWeek === selDow).sort((a, b) => a.position - b.position),
    [planItems, selDow]
  );
  const selVS = useMemo(() =>
    selItems.map(item => {
      const done = sessions.find(s => s.cycleId === item.id && s.date === selected) ?? null;
      return { item, done, isDone: !!done };
    }),
    [selItems, sessions, selected]
  );
  const doneCount = selVS.filter(v => v.isDone).length;

  // ── Schedule modal ────────────────────────────────────────────────────────
  type DTC = { enabled: boolean; hours: string; minutes: string };
  const [schedModal, setSchedModal] = useState(false);
  const [schedForm, setSchedForm] = useState<Record<number, DTC>>({});
  function openSched() {
    const init: Record<number, DTC> = {};
    for (const d of WEEK_ORDER) {
      const ex = planDays.find(p => p.dayOfWeek === d);
      init[d] = ex ? { enabled: true, hours: String(Math.floor(ex.plannedMin / 60)), minutes: String(ex.plannedMin % 60) } : { enabled: false, hours: "1", minutes: "0" };
    }
    setSchedForm(init); setSchedModal(true);
  }
  function saveSched() {
    savePlan(WEEK_ORDER.filter(d => schedForm[d]?.enabled)
      .map(d => ({ dayOfWeek: d, plannedMin: (parseInt(schedForm[d].hours) || 0) * 60 + (parseInt(schedForm[d].minutes) || 0) }))
      .filter(c => c.plannedMin > 0));
    setSchedModal(false);
  }
  const canSaveSched = WEEK_ORDER.some(d => schedForm[d]?.enabled && ((parseInt(schedForm[d].hours) || 0) * 60 + (parseInt(schedForm[d].minutes) || 0)) > 0);

  // ── Day plan modal ────────────────────────────────────────────────────────
  const [dayModal, setDayModal] = useState<number | null>(null);
  type EditItem = { groupId: string; subject: string; sessionType: SessionType; description: string };
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [addForm, setAddForm] = useState<EditItem>({ groupId: activeGroupId ?? "", subject: "", sessionType: "content", description: "" });
  function openDayModal(dow: number) {
    setEditItems(planItems.filter(pi => pi.dayOfWeek === dow).sort((a, b) => a.position - b.position).map(pi => ({ groupId: pi.groupId ?? "", subject: pi.subject, sessionType: pi.sessionType, description: pi.description ?? "" })));
    setAddForm({ groupId: activeGroupId ?? "", subject: "", sessionType: "content", description: "" });
    setDayModal(dow);
  }
  function addItem() {
    if (!addForm.groupId || !addForm.subject) return;
    setEditItems(p => [...p, { ...addForm }]);
    setAddForm(f => ({ ...f, subject: "", description: "" }));
  }
  function saveDayPlan() {
    if (dayModal === null) return;
    savePlanItems(dayModal, editItems.map(i => ({ groupId: i.groupId || null, subject: i.subject, sessionType: i.sessionType, description: i.description.trim() || undefined })));
    setDayModal(null);
  }
  const formSubjects = subjects.filter(s => s.groupId === addForm.groupId);
  const formGroup = groups.find(g => g.id === addForm.groupId);

  // ── Done modal ────────────────────────────────────────────────────────────
  const [doneModal, setDoneModal] = useState<{ item: StudyPlanItem; date: string } | null>(null);
  const [doneForm, setDoneForm] = useState({ hours: "0", minutes: "30", notes: "" });
  function openDone(item: StudyPlanItem, date: string) { setDoneForm({ hours: "0", minutes: "30", notes: "" }); setDoneModal({ item, date }); }
  function regDone() {
    if (!doneModal) return;
    const actualMin = (parseInt(doneForm.hours) || 0) * 60 + (parseInt(doneForm.minutes) || 0);
    if (!actualMin) return;
    const planDay = planDays.find(p => p.dayOfWeek === doneModal.item.dayOfWeek);
    addSession({ cycleId: doneModal.item.id, groupId: doneModal.item.groupId, subject: doneModal.item.subject, durationMin: planDay?.plannedMin ?? 0, actualMin, date: doneModal.date, notes: doneForm.notes.trim() || undefined });
    setDoneModal(null);
  }
  const canDone = ((parseInt(doneForm.hours) || 0) * 60 + (parseInt(doneForm.minutes) || 0)) > 0;

  // ── Detail modal ──────────────────────────────────────────────────────────
  const [detailModal, setDetailModal] = useState<{ item: StudyPlanItem; date: string; actualMin?: number; notes?: string; sessionId: string } | null>(null);

  const selDate = parseLocal(selected);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px 28px", height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexShrink: 0 }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: "var(--text-primary)" }}>
          Sessões de Estudo
        </h1>
        <button onClick={openSched} className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px", gap: 6 }}>
          <Settings2 style={{ width: 13, height: 13 }} /> Horários
        </button>
      </div>

      {/* Split layout */}
      <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0, alignItems: "flex-start" }}>

        {/* ── Left: Mini calendar ── */}
        <div style={{ width: 256, flexShrink: 0, border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface)" }}>

          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", padding: "10px 10px 10px 14px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {MONTHS[viewMonth].slice(0,3)} {viewYear}
            </span>
            <button onClick={prevMonth} style={S.iconBtn}><ChevronLeft style={{ width: 14, height: 14 }} /></button>
            <button onClick={nextMonth} style={S.iconBtn}><ChevronRight style={{ width: 14, height: 14 }} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "6px 6px 2px" }}>
            {DAY_ABBR.map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", padding: "2px 0" }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 6px 8px", gap: "2px 0" }}>
            {grid.map((dateStr, idx) => {
              if (!dateStr) return <div key={`e${idx}`} style={{ height: 38 }} />;
              const dow = getDow(dateStr);
              const planDay = planDays.find(p => p.dayOfWeek === dow);
              const dayItems = planItems.filter(pi => pi.dayOfWeek === dow);
              const visItems = dayItems.slice(0, 3);
              const isToday = dateStr === today;
              const isSel = dateStr === selected;
              const dateNum = parseInt(dateStr.split("-")[2]);
              const isPast = dateStr < today;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelected(dateStr)}
                  style={{
                    height: 38,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 3,
                    cursor: "pointer",
                    borderRadius: 6,
                    background: isSel ? "#7c3aed12" : "transparent",
                    outline: isSel ? "1px solid #7c3aed30" : "none",
                    gap: 2,
                  }}
                >
                  <span style={{
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: 11,
                    fontWeight: isToday ? 700 : 400,
                    background: isToday ? "#7c3aed" : "transparent",
                    color: isToday ? "white" : isSel ? "#7c3aed" : planDay ? "var(--text-primary)" : "var(--text-muted)",
                  }}>
                    {dateNum}
                  </span>

                  {/* Event dots */}
                  {planDay && visItems.length > 0 && (
                    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                      {visItems.map(item => {
                        const g = groups.find(g => g.id === item.groupId);
                        const isDone = sessions.some(s => s.cycleId === item.id && s.date === dateStr);
                        return (
                          <div key={item.id} style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: isDone ? "#059669" : g?.color ?? "var(--border-strong)",
                            opacity: isPast && !isDone ? 0.35 : 1,
                          }} />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          {planDays.length > 0 && (
            <div style={{ padding: "8px 14px 12px", borderTop: "1px solid var(--border)" }}>
              <p style={{ ...S.label, marginBottom: 6 }}>Dias ativos</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                {WEEK_ORDER.filter(d => planDays.some(p => p.dayOfWeek === d)).map(d => (
                  <span key={d} style={{ fontSize: 11, color: "var(--text-secondary)" }}>{DAY_SHORT[d]}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Day detail ── */}
        <div style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface)", display: "flex", flexDirection: "column" }}>

          {/* Day header */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: "var(--text-primary)" }}>
                    {DAY_FULL[selDate.getDay()]}
                  </p>
                  {selected === today && (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", padding: "2px 7px", borderRadius: 99, background: "#7c3aed", color: "white" }}>
                      hoje
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                  {selDate.getDate()} de {MONTHS[selDate.getMonth()]} de {selDate.getFullYear()}
                  {selPlanDay && ` · ${formatDuration(selPlanDay.plannedMin)} planejados`}
                  {selVS.length > 0 && ` · ${doneCount}/${selVS.length} concluída${selVS.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {selPlanDay && (
                  <button onClick={() => openDayModal(selDow)}
                    style={{ fontSize: 12, padding: "5px 11px", borderRadius: 7, background: "var(--surface-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Settings2 style={{ width: 12, height: 12 }} /> Editar
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {selVS.length > 0 && (
              <div style={{ marginTop: 10, height: 3, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(doneCount / selVS.length) * 100}%`, background: doneCount === selVS.length ? "#059669" : "#7c3aed", borderRadius: 99, transition: "width 0.3s" }} />
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {!selPlanDay ? (
              <div style={{ padding: "32px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌙</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>Dia livre</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Nenhum estudo planejado · use Horários para ativar</p>
                </div>
                <button onClick={() => openDayModal(selDow)} className="btn btn-ghost" style={{ fontSize: 12, marginTop: 2 }}>
                  <Plus style={{ width: 13, height: 13 }} /> Planejar mesmo assim
                </button>
              </div>
            ) : selVS.length === 0 ? (
              <div style={{ padding: "32px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📋</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>Sem matérias planejadas</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Adicione o que vai estudar neste dia</p>
                </div>
                <button onClick={() => openDayModal(selDow)} className="btn btn-primary" style={{ fontSize: 12, marginTop: 2 }}>
                  <Plus style={{ width: 13, height: 13 }} /> Planejar dia
                </button>
              </div>
            ) : (
              <>
                {selVS.map(({ item, done, isDone }, idx) => {
                  const g = groups.find(g => g.id === item.groupId);
                  const tc = SESSION_TYPE_CONFIG[item.sessionType];
                  return (
                    <div key={item.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 18px",
                      borderBottom: idx < selVS.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      {/* Status indicator */}
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isDone ? "#059669" : g ? `${g.color}18` : "var(--surface-subtle)",
                        fontSize: isDone ? undefined : 16,
                        border: isDone ? "none" : `1.5px solid ${g?.color ?? "var(--border-strong)"}33`,
                      }}>
                        {isDone
                          ? <Check style={{ width: 15, height: 15, color: "white" }} />
                          : <span>{tc.emoji}</span>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.subject}
                          </span>
                          {g && (
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: `${g.color}15`, color: g.color, fontWeight: 500, flexShrink: 0 }}>
                              {g.emoji} {g.name}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                          <span>{tc.emoji} {tc.label}</span>
                          {isDone && done?.actualMin !== undefined && (
                            <>
                              <span style={{ opacity: 0.4 }}>·</span>
                              <span style={{ color: "#059669", fontWeight: 500 }}>{formatDuration(done.actualMin)}</span>
                            </>
                          )}
                          {isDone && done?.notes && (
                            <>
                              <span style={{ opacity: 0.4 }}>·</span>
                              <FileText style={{ width: 10, height: 10 }} />
                            </>
                          )}
                        </div>
                        {item.description && (
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontStyle: "italic", lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {isDone ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <button
                            onClick={() => done && setDetailModal({ item, date: selected, actualMin: done.actualMin, notes: done.notes, sessionId: done.id })}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--surface-subtle)", color: "var(--text-secondary)", border: "none", cursor: "pointer" }}>
                            Ver
                          </button>
                          <button
                            onClick={() => done && deleteSession(done.id)}
                            style={{ ...S.iconBtn, padding: 5 }}>
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openDone(item, selected)}
                          style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, background: "transparent", color: "#059669", border: "1.5px solid #059669", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, flexShrink: 0, transition: "background 0.15s" }}>
                          <Check style={{ width: 12, height: 12 }} /> Concluir
                        </button>
                      )}
                    </div>
                  );
                })}

                <div style={{ padding: "11px 18px", borderTop: "1px solid var(--border)" }}>
                  <button onClick={() => openDayModal(selDow)}
                    style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Plus style={{ width: 13, height: 13 }} /> Adicionar matéria
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Schedule modal ── */}
      {schedModal && (
        <div className="modal-overlay" onClick={() => setSchedModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, color: "var(--text-primary)" }}>Horários de estudo</h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Defina os dias e o tempo por sessão</p>
              </div>
              <button onClick={() => setSchedModal(false)} style={S.closeBtn}>×</button>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {WEEK_ORDER.map((d, i) => {
                const cfg = schedForm[d] ?? { enabled: false, hours: "1", minutes: "0" };
                const min = (parseInt(cfg.hours) || 0) * 60 + (parseInt(cfg.minutes) || 0);
                return (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderBottom: i < WEEK_ORDER.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <button
                      onClick={() => setSchedForm(p => ({ ...p, [d]: { ...cfg, enabled: !cfg.enabled } }))}
                      style={{ width: 36, height: 22, borderRadius: 99, position: "relative", flexShrink: 0, background: cfg.enabled ? "#7c3aed" : "var(--border)", border: "none", cursor: "pointer", transition: "background 0.15s" }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: cfg.enabled ? 17 : 3, transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
                    </button>

                    <span style={{ width: 80, fontSize: 14, fontWeight: 500, color: cfg.enabled ? "var(--text-primary)" : "var(--text-muted)", flexShrink: 0, transition: "color 0.15s" }}>
                      {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d]}
                    </span>

                    {cfg.enabled ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                        <div style={{ position: "relative", width: 84 }}>
                          <input type="number" min="0" max="23" className="input"
                            style={{ textAlign: "center", paddingRight: 22 }}
                            value={cfg.hours}
                            onChange={e => setSchedForm(p => ({ ...p, [d]: { ...cfg, hours: e.target.value } }))} />
                          <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-muted)", pointerEvents: "none" }}>h</span>
                        </div>
                        <div style={{ position: "relative", width: 92 }}>
                          <select className="input"
                            style={{ textAlign: "center", paddingRight: 22, appearance: "none", backgroundImage: "none" }}
                            value={cfg.minutes}
                            onChange={e => setSchedForm(p => ({ ...p, [d]: { ...cfg, minutes: e.target.value } }))}>
                            <option value="0">00</option>
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="45">45</option>
                          </select>
                          <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-muted)", pointerEvents: "none" }}>min</span>
                        </div>
                        {min > 0 && (
                          <span style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>{formatDuration(min)}</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>—</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 9, padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setSchedModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={saveSched} disabled={!canSaveSched} className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Day plan modal ── */}
      {dayModal !== null && (
        <div className="modal-overlay" onClick={() => setDayModal(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, color: "var(--text-primary)" }}>
                    {["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][dayModal]}
                  </h2>
                  {(() => { const pd = planDays.find(p => p.dayOfWeek === dayModal); return pd ? <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{formatDuration(pd.plannedMin)} planejados</p> : null; })()}
                </div>
                <button onClick={() => setDayModal(null)} style={S.closeBtn}>×</button>
              </div>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {/* Items list — clean rows, no card backgrounds */}
              {editItems.length > 0 && (
                <div style={{ borderBottom: "1px solid var(--border)" }}>
                  {editItems.map((item, idx) => {
                    const g = groups.find(g => g.id === item.groupId);
                    const tc = SESSION_TYPE_CONFIG[item.sessionType];
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 24px", borderBottom: idx < editItems.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: g?.color ?? "var(--border-strong)" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.subject}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                            {tc.emoji} {tc.label}
                            {item.description ? ` · ${item.description}` : ""}
                          </p>
                        </div>
                        <button onClick={() => setEditItems(p => p.filter((_, i) => i !== idx))} style={{ ...S.iconBtn, padding: 4 }}>
                          <X style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add form */}
              <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Session type — segmented control */}
                <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                  {SESSION_TYPES.map((type, i) => {
                    const tc = SESSION_TYPE_CONFIG[type];
                    const active = addForm.sessionType === type;
                    return (
                      <button key={type} onClick={() => setAddForm(f => ({ ...f, sessionType: type }))}
                        style={{
                          flex: 1,
                          padding: "8px 4px",
                          border: "none",
                          borderRight: i < SESSION_TYPES.length - 1 ? "1px solid var(--border)" : "none",
                          background: active ? "#7c3aed" : "transparent",
                          color: active ? "white" : "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: active ? 600 : 400,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          transition: "background 0.1s, color 0.1s",
                          whiteSpace: "nowrap",
                        }}>
                        <span style={{ fontSize: 13 }}>{tc.emoji}</span>
                        {tc.label}
                      </button>
                    );
                  })}
                </div>

                {/* Group */}
                {activeGroupId ? (
                  (() => {
                    const g = groups.find(g => g.id === activeGroupId);
                    return g ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{g.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>grupo ativo</span>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <select className="select"
                    value={addForm.groupId} onChange={e => setAddForm(f => ({ ...f, groupId: e.target.value, subject: "" }))}>
                    <option value="">Grupo</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
                  </select>
                )}

                {/* Subject */}
                {addForm.groupId && (formSubjects.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma matéria neste grupo.</p>
                ) : (
                  <select className="select"
                    value={addForm.subject} onChange={e => setAddForm(f => ({ ...f, subject: e.target.value }))}>
                    <option value="">Matéria</option>
                    {formSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                ))}

                {/* Description — floating label, only when subject selected */}
                {addForm.subject && (
                  <Field label="Descrição — capítulos, foco, metas...">
                    <textarea className="input" style={{ resize: "none" }}
                      value={addForm.description}
                      onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
                  </Field>
                )}

                <button onClick={addItem} disabled={!addForm.groupId || !addForm.subject} className="btn btn-ghost"
                  style={{ width: "100%", opacity: (!addForm.groupId || !addForm.subject) ? 0.4 : 1 }}>
                  <Plus style={{ width: 14, height: 14 }} /> Adicionar
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 9, padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setDayModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={saveDayPlan} className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Done modal ── */}
      {doneModal && (
        <div className="modal-overlay" onClick={() => setDoneModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Header with subject as title */}
            {(() => {
              const g = groups.find(g => g.id === doneModal.item.groupId);
              const tc = SESSION_TYPE_CONFIG[doneModal.item.sessionType];
              return (
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        {g && <span style={{ width: 7, height: 7, borderRadius: "50%", background: g.color, flexShrink: 0 }} />}
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                          {tc.emoji} {tc.label}{g ? ` · ${g.name}` : ""}
                        </span>
                      </div>
                      <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doneModal.item.subject}
                      </h2>
                    </div>
                    <button onClick={() => setDoneModal(null)} style={{ ...S.closeBtn, flexShrink: 0 }}>×</button>
                  </div>
                </div>
              );
            })()}

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", flex: 1 }}>
              {/* Time */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginBottom: 10, letterSpacing: 0.2 }}>Quanto tempo você estudou?</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input type="number" min="0" max="23" className="input" style={{ textAlign: "center", paddingRight: 30 }}
                      value={doneForm.hours} onChange={e => setDoneForm(f => ({ ...f, hours: e.target.value }))} />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", pointerEvents: "none", fontWeight: 500 }}>h</span>
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    <select className="input" style={{ textAlign: "center", appearance: "none", backgroundImage: "none", paddingRight: 30 }}
                      value={doneForm.minutes} onChange={e => setDoneForm(f => ({ ...f, minutes: e.target.value }))}>
                      <option value="0">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", pointerEvents: "none", fontWeight: 500 }}>min</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <Field label="Anotações (opcional)">
                <textarea className="input" style={{ resize: "none" }}
                  value={doneForm.notes} onChange={e => setDoneForm(f => ({ ...f, notes: e.target.value }))} />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 9, padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setDoneModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={regDone} disabled={!canDone} className="btn btn-primary" style={{ flex: 1 }}>
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail modal ── */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Header with subject as title */}
            {(() => {
              const g = groups.find(g => g.id === detailModal.item.groupId);
              const tc = SESSION_TYPE_CONFIG[detailModal.item.sessionType];
              const d = parseLocal(detailModal.date);
              return (
                <>
                  <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                          {g && <span style={{ width: 7, height: 7, borderRadius: "50%", background: g.color, flexShrink: 0 }} />}
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                            {tc.emoji} {tc.label}{g ? ` · ${g.name}` : ""} · {d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}
                          </span>
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {detailModal.item.subject}
                        </h2>
                      </div>
                      <button onClick={() => setDetailModal(null)} style={{ ...S.closeBtn, flexShrink: 0 }}>×</button>
                    </div>
                  </div>

                  <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1 }}>
                    {/* Stats — inline, no boxes */}
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                      <div>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 3 }}>Tempo estudado</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: "#059669", letterSpacing: -0.5 }}>
                          {detailModal.actualMin !== undefined ? formatDuration(detailModal.actualMin) : "—"}
                        </p>
                      </div>
                      <div style={{ width: 1, height: 36, background: "var(--border)" }} />
                      <div>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 3 }}>Data</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                          {d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {detailModal.notes ? (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 8 }}>Anotações</p>
                        <p style={{ fontSize: 13, color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                          {detailModal.notes}
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                        Nenhuma anotação registrada.
                      </p>
                    )}
                  </div>

                  <div style={{ padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => setDetailModal(null)} className="btn btn-ghost" style={{ width: "100%" }}>Fechar</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
