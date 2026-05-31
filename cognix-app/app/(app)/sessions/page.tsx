"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { Field } from "@/components/ui";
import { SessionType, StudyPlanItem, useStore } from "@/lib/store";

function toDateStr(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocal(date: string) {
  return new Date(`${date}T12:00:00`);
}

function getDow(date: string) {
  return parseLocal(date).getDay();
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function buildGrid(year: number, month: number): (string | null)[] {
  const total = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const grid: (string | null)[] = new Array(offset).fill(null);

  for (let day = 1; day <= total; day++) {
    grid.push(toDateStr(new Date(year, month, day)));
  }

  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DAY_ABBR = ["S", "T", "Q", "Q", "S", "S", "D"];
const DAY_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SESSION_TYPES: SessionType[] = ["content", "review", "exercises", "simulado"];
const SESSION_TYPE_LABELS: Record<SessionType, { label: string; emoji: string }> = {
  content: { label: "Conteúdo", emoji: "📖" },
  review: { label: "Revisão", emoji: "🔄" },
  exercises: { label: "Exercícios", emoji: "📝" },
  simulado: { label: "Simulado", emoji: "🎯" },
};

const styles = {
  label: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.7,
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
  },
  iconButton: {
    padding: 7,
    borderRadius: 8,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "none",
    background: "var(--surface-subtle)",
    cursor: "pointer",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
};

type DayTimeConfig = { enabled: boolean; hours: string; minutes: string };
type EditItem = { groupId: string; subject: string; sessionType: SessionType; description: string };

export default function SessionsPage() {
  const {
    groups,
    subjects,
    planDays,
    planItems,
    sessions,
    activeGroupId,
    savePlan,
    savePlanItems,
    addSession,
    deleteSession,
  } = useStore();

  const today = toDateStr(new Date());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selected, setSelected] = useState(today);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<Record<number, DayTimeConfig>>({});
  const [dayModal, setDayModal] = useState<number | null>(null);
  const [dayModalDate, setDayModalDate] = useState<string>(today);
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [addForm, setAddForm] = useState<EditItem>({
    groupId: activeGroupId ?? "",
    subject: "",
    sessionType: "content",
    description: "",
  });
  const [doneModal, setDoneModal] = useState<{ item: StudyPlanItem; date: string } | null>(null);
  const [doneForm, setDoneForm] = useState({ hours: "0", minutes: "30", notes: "" });
  const [detailModal, setDetailModal] = useState<{
    item: StudyPlanItem;
    date: string;
    actualMin?: number;
    notes?: string;
    sessionId: string;
  } | null>(null);

  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const selectedDate = parseLocal(selected);
  const selectedDow = getDow(selected);
  const selectedPlanDay = planDays.find((planDay) => planDay.dayOfWeek === selectedDow);
  const isSelectedPast = selected < today;

  const selectedItems = useMemo(
    () => {
      const dateItems = planItems.filter((item) => item.date === selected);
      const legacyWeekItems = planItems.filter((item) => !item.date && item.dayOfWeek === selectedDow);
      return (dateItems.length > 0 ? dateItems : legacyWeekItems).sort((a, b) => a.position - b.position);
    },
    [planItems, selected, selectedDow],
  );

  const selectedViewItems = useMemo(
    () =>
      selectedItems.map((item) => {
        const done = sessions.find((session) =>
          session.date === selected &&
          (session.cycleId === item.id || (session.subject === item.subject && session.groupId === item.groupId))
        ) ?? null;
        return { item, done, isDone: Boolean(done) };
      }),
    [selectedItems, sessions, selected],
  );

  const doneCount = selectedViewItems.filter((viewItem) => viewItem.isDone).length;
  const canSaveSchedule = WEEK_ORDER.some((day) => {
    const config = scheduleForm[day];
    const minutes = (parseInt(config?.hours ?? "0") || 0) * 60 + (parseInt(config?.minutes ?? "0") || 0);
    return Boolean(config?.enabled && minutes > 0);
  });
  const canRegisterDone = ((parseInt(doneForm.hours) || 0) * 60 + (parseInt(doneForm.minutes) || 0)) > 0;
  const formSubjects = subjects.filter((subject) => subject.groupId === addForm.groupId);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
      return;
    }
    setViewMonth((month) => month - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
      return;
    }
    setViewMonth((month) => month + 1);
  }

  function openScheduleModal() {
    const initialForm: Record<number, DayTimeConfig> = {};
    for (const day of WEEK_ORDER) {
      const existing = planDays.find((planDay) => planDay.dayOfWeek === day);
      initialForm[day] = existing
        ? { enabled: true, hours: String(Math.floor(existing.plannedMin / 60)), minutes: String(existing.plannedMin % 60) }
        : { enabled: false, hours: "1", minutes: "0" };
    }
    setScheduleForm(initialForm);
    setScheduleModalOpen(true);
  }

  function saveSchedule() {
    savePlan(
      WEEK_ORDER.filter((day) => scheduleForm[day]?.enabled)
        .map((day) => ({
          dayOfWeek: day,
          plannedMin: (parseInt(scheduleForm[day].hours) || 0) * 60 + (parseInt(scheduleForm[day].minutes) || 0),
        }))
        .filter((config) => config.plannedMin > 0),
    );
    setScheduleModalOpen(false);
  }

  function openDayModal(dayOfWeek: number, date?: string) {
    const targetDate = date ?? selected;
    setDayModalDate(targetDate);
    setEditItems(
      planItems
        .filter((item) => item.date === targetDate)
        .sort((a, b) => a.position - b.position)
        .map((item) => ({
          groupId: item.groupId ?? "",
          subject: item.subject,
          sessionType: item.sessionType,
          description: item.description ?? "",
        })),
    );
    setAddForm({ groupId: activeGroupId ?? "", subject: "", sessionType: "content", description: "" });
    setDayModal(dayOfWeek);
  }

  function addItem() {
    if (!addForm.groupId || !addForm.subject) return;
    setEditItems((items) => [...items, { ...addForm }]);
    setAddForm((form) => ({ ...form, subject: "", description: "" }));
  }

  function saveDayPlan() {
    if (dayModal === null) return;
    savePlanItems(
      dayModal,
      editItems.map((item) => ({
        groupId: item.groupId || null,
        subject: item.subject,
        sessionType: item.sessionType,
        description: item.description.trim() || undefined,
      })),
      dayModalDate,
    );
    setDayModal(null);
  }

  function openDoneModal(item: StudyPlanItem, date: string) {
    if (date < today) return;
    setDoneForm({ hours: "0", minutes: "0", notes: "" });
    setDoneModal({ item, date });
  }

  function registerDone() {
    if (!doneModal || doneModal.date < today) return;
    const actualMin = (parseInt(doneForm.hours) || 0) * 60 + (parseInt(doneForm.minutes) || 0);
    if (!actualMin) return;

    const planDay = planDays.find((day) => day.dayOfWeek === doneModal.item.dayOfWeek);
    addSession({
      cycleId: doneModal.item.id,
      groupId: doneModal.item.groupId,
      subject: doneModal.item.subject,
      durationMin: planDay?.plannedMin ?? 0,
      actualMin,
      date: doneModal.date,
      notes: doneForm.notes.trim() || undefined,
    });
    setDoneModal(null);
  }

  function renderEmptyState(title: string, description: string, icon: React.ReactNode, action?: React.ReactNode) {
    return (
      <div style={{ padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--surface-subtle)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 750, color: "var(--text-primary)", marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{description}</p>
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className="page-wrap" style={{ padding: "26px 30px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 850, letterSpacing: -0.3, color: "var(--text-primary)" }}>Sessões de Estudo</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 3 }}>Planeje a semana e registre apenas o dia selecionado.</p>
        </div>
        <button onClick={openScheduleModal} className="btn btn-ghost" style={{ fontSize: 14, padding: "8px 14px", gap: 7 }}>
          <Settings2 style={{ width: 15, height: 15 }} /> Horários
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <aside style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "13px 16px 11px", borderBottom: "1px solid var(--border)" }}>
            <button onClick={prevMonth} style={styles.iconButton} aria-label="Mês anterior">
              <ChevronLeft style={{ width: 15, height: 15 }} />
            </button>
            <span style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={styles.iconButton} aria-label="Próximo mês">
              <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
              <div key={`${day}-${index}`} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", padding: "8px 0", letterSpacing: 0.4 }}>
                {day}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {grid.map((dateStr, index) => {
              if (!dateStr) return <div key={`empty-${index}`} className="cal-cell" style={{ minHeight: 80, borderRight: (index + 1) % 7 !== 0 ? "1px solid var(--border)" : "none", borderBottom: "1px solid var(--border)", opacity: 0.3, background: "var(--surface-subtle)" }} />;

              const dayOfWeek = getDow(dateStr);
              const planDay = planDays.find((day) => day.dayOfWeek === dayOfWeek);
              const plannedItems = planItems
                .filter((item) => item.date === dateStr && item.subject.trim().length > 0)
                .slice(0, 3);
              const completedSessions = sessions
                .filter((session) => session.date === dateStr && session.subject.trim().length > 0)
                .slice(0, 3);
              const displayItems = completedSessions.length > 0 ? completedSessions : plannedItems;
              const isToday = dateStr === today;
              const isSelected = dateStr === selected;
              const isPast = dateStr < today;
              const dateNum = parseInt(dateStr.split("-")[2]);
              const col = index % 7;

              return (
                <button
                  key={dateStr}
                  className="cal-cell"
                  onClick={() => { setSelected(dateStr); openDayModal(dayOfWeek, dateStr); }}
                  style={{
                    minHeight: 80,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "6px 7px 6px",
                    borderRight: col < 6 ? "1px solid var(--border)" : "none",
                    borderBottom: "1px solid var(--border)",
                    border: isSelected ? `2px solid var(--primary)` : undefined,
                    background: isSelected ? "var(--primary-subtle)" : isToday ? `var(--surface-subtle)` : "transparent",
                    gap: 4,
                    opacity: isPast && !isSelected ? 0.5 : 1,
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: 12,
                      fontWeight: isToday ? 900 : 650,
                      background: isToday ? "var(--primary)" : "transparent",
                      color: isToday ? "var(--bg)" : isSelected ? "var(--primary-subtle-text)" : planDay ? "var(--text-primary)" : "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {dateNum}
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                    {displayItems.map((item) => {
                      const group = groups.find((entry) => entry.id === item.groupId);
                      const isDone = completedSessions.length > 0;
                      return (
                        <span
                          key={item.id}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1.3,
                            padding: "2px 5px",
                            borderRadius: 4,
                            background: isDone ? "#05966920" : group ? `${group.color}20` : "var(--surface-subtle)",
                            color: isDone ? "#059669" : group?.color ?? "var(--text-secondary)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            width: "100%",
                          }}
                        >
                          {item.subject}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = toDateStr(d);
            const dow = d.getDay();
            const isToday = dateStr === today;
            const planDay = planDays.find((pd) => pd.dayOfWeek === dow);
            const dayItems = planItems
              .filter((item) => item.date === dateStr && item.subject.trim().length > 0)
              .sort((a, b) => a.position - b.position);
            const daySessions = sessions.filter((s) => s.date === dateStr);
            const viewItems = dayItems.map((item) => {
              const done = daySessions.find((s) => s.cycleId === item.id || (s.subject === item.subject && s.groupId === item.groupId)) ?? null;
              return { item, done, isDone: Boolean(done) };
            });
            const doneCnt = viewItems.filter((v) => v.isDone).length;

            return (
              <div key={dateStr} style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", background: "var(--surface)" }}>
                {/* Header do dia */}
                <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: isToday ? "var(--surface-subtle)" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "center", minWidth: 36 }}>
                      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: isToday ? "var(--primary)" : "var(--text-muted)" }}>{DAY_SHORT[dow]}</p>
                      <p style={{ fontSize: 20, fontWeight: 850, lineHeight: 1.1, color: isToday ? "var(--primary)" : "var(--text-primary)" }}>{d.getDate()}</p>
                    </div>
                    <div style={{ width: 1, height: 32, background: "var(--border)" }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ fontSize: 14, fontWeight: 750, color: "var(--text-primary)" }}>{DAY_FULL[dow]}</span>
                        {isToday && <span style={{ fontSize: 10, fontWeight: 850, letterSpacing: 0.8, textTransform: "uppercase", padding: "2px 7px", borderRadius: 99, background: "var(--primary)", color: "var(--bg)" }}>hoje</span>}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                        {planDay ? `${formatDuration(planDay.plannedMin)} planejados` : "Dia livre"}
                        {viewItems.length > 0 ? ` · ${doneCnt}/${viewItems.length} concluídas` : ""}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => openDayModal(dow, dateStr)} className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px", gap: 5, flexShrink: 0 }}>
                    <Settings2 style={{ width: 12, height: 12 }} /> {dayItems.length > 0 ? "Editar" : "Planejar"}
                  </button>
                </div>

                {/* Matérias — timeline */}
                {viewItems.length > 0 && (
                  <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 14, display: "flex", flexDirection: "column", gap: 0 }}>
                    {viewItems.map(({ item, done, isDone }, idx) => {
                      const group = groups.find((entry) => entry.id === item.groupId);
                      const type = SESSION_TYPE_LABELS[item.sessionType];
                      const barColor = isDone ? "#059669" : group?.color ?? "var(--primary)";
                      const isLast = idx === viewItems.length - 1;
                      return (
                        <div key={item.id} style={{ display: "flex", gap: 0 }}>
                          {/* linha vertical + ponto */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0, marginRight: 14 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: barColor, marginTop: 18, flexShrink: 0, border: `2px solid var(--surface)`, boxShadow: `0 0 0 2px ${barColor}` }} />
                            {!isLast && <div style={{ width: 2, flex: 1, background: "var(--border)", marginTop: 4 }} />}
                          </div>

                          {/* conteúdo */}
                          <div style={{ flex: 1, minWidth: 0, paddingTop: 12, paddingBottom: isLast ? 0 : 12 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 14, fontWeight: 750, color: isDone ? "var(--text-muted)" : "var(--text-primary)", textDecoration: isDone ? "line-through" : "none" }}>{item.subject}</span>
                                  {group && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 99, background: `${group.color}18`, color: group.color, fontWeight: 700 }}>{group.name}</span>}
                                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{type.emoji} {type.label}</span>
                                  {isDone && done?.actualMin !== undefined && <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>· {formatDuration(done.actualMin)}</span>}
                                  {isDone && done?.notes && <FileText style={{ width: 12, height: 12, color: "var(--text-muted)" }} />}
                                </div>
                                {item.description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.5 }}>{item.description}</p>}
                              </div>

                              {isDone ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                                  <button onClick={() => done && setDetailModal({ item, date: dateStr, actualMin: done.actualMin, notes: done.notes, sessionId: done.id })} className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 9px" }}>Ver</button>
                                  <button onClick={() => done && deleteSession(done.id)} style={{ ...styles.iconButton, padding: 4 }} aria-label="Remover">
                                    <Trash2 style={{ width: 13, height: 13 }} />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => openDoneModal(item, dateStr)} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 7, background: "transparent", color: "#059669", border: "1px solid #05966960", cursor: "pointer", fontWeight: 750, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0 }}>
                                  <Check style={{ width: 12, height: 12 }} /> Concluir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {scheduleModalOpen && (
        <div className="modal-overlay" onClick={() => setScheduleModalOpen(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <ModalTitle
              title="Horários de estudo"
              description="Defina os dias e o tempo por sessão."
              onClose={() => setScheduleModalOpen(false)}
            />

            <div style={{ overflowY: "auto", flex: 1 }}>
              {WEEK_ORDER.map((day, index) => {
                const config = scheduleForm[day] ?? { enabled: false, hours: "1", minutes: "0" };
                const minutes = (parseInt(config.hours) || 0) * 60 + (parseInt(config.minutes) || 0);

                return (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", borderBottom: index < WEEK_ORDER.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <button
                      onClick={() => setScheduleForm((form) => ({ ...form, [day]: { ...config, enabled: !config.enabled } }))}
                      style={{ width: 38, height: 23, borderRadius: 99, position: "relative", flexShrink: 0, background: config.enabled ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer" }}
                      aria-label={`Alternar ${DAY_FULL[day]}`}
                    >
                      <span style={{ width: 17, height: 17, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: config.enabled ? 18 : 3, transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
                    </button>

                    <span style={{ width: 86, fontSize: 15, fontWeight: 700, color: config.enabled ? "var(--text-primary)" : "var(--text-muted)", flexShrink: 0 }}>
                      {DAY_SHORT[day]}
                    </span>

                    {config.enabled ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                        <TimeInput value={config.hours} suffix="h" onChange={(value) => setScheduleForm((form) => ({ ...form, [day]: { ...config, hours: value } }))} />
                        <MinuteSelect value={config.minutes} onChange={(value) => setScheduleForm((form) => ({ ...form, [day]: { ...config, minutes: value } }))} />
                        {minutes > 0 && <span style={{ fontSize: 14, color: "var(--primary)", fontWeight: 750 }}>{formatDuration(minutes)}</span>}
                      </div>
                    ) : (
                      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>-</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10, padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setScheduleModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={saveSchedule} disabled={!canSaveSchedule} className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {dayModal !== null && (
        <div className="modal-overlay" onClick={() => setDayModal(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={(event) => event.stopPropagation()}>
            <ModalTitle
              title={`${DAY_FULL[dayModal]}, ${parseLocal(dayModalDate).getDate()} de ${MONTHS[parseLocal(dayModalDate).getMonth()]}`}
              description={planDays.find((day) => day.dayOfWeek === dayModal) ? `${formatDuration(planDays.find((day) => day.dayOfWeek === dayModal)!.plannedMin)} planejados` : undefined}
              onClose={() => setDayModal(null)}
            />

            <div style={{ overflowY: "auto", flex: 1 }}>
              {editItems.length > 0 && (
                <div style={{ borderBottom: "1px solid var(--border)" }}>
                  {editItems.map((item, index) => {
                    const group = groups.find((entry) => entry.id === item.groupId);
                    const type = SESSION_TYPE_LABELS[item.sessionType];

                    return (
                      <div key={`${item.subject}-${index}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: index < editItems.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: group?.color ?? "var(--border-strong)" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 750, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.subject}</p>
                          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 1 }}>
                            {type.label}
                            {item.description ? ` - ${item.description}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setAddForm({ groupId: item.groupId, subject: item.subject, sessionType: item.sessionType, description: item.description });
                            setEditItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
                          }}
                          style={{ ...styles.iconButton, padding: 5 }} aria-label="Editar matéria"
                        >
                          <Pencil style={{ width: 13, height: 13 }} />
                        </button>
                        <button onClick={() => setEditItems((items) => items.filter((_, itemIndex) => itemIndex !== index))} style={{ ...styles.iconButton, padding: 5 }} aria-label="Remover matéria">
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", border: "1px solid var(--border)", borderRadius: 9, overflow: "hidden" }}>
                  {SESSION_TYPES.map((type, index) => {
                    const config = SESSION_TYPE_LABELS[type];
                    const active = addForm.sessionType === type;

                    return (
                      <button
                        key={type}
                        onClick={() => setAddForm((form) => ({ ...form, sessionType: type }))}
                        style={{
                          padding: "9px 5px",
                          border: "none",
                          borderRight: index < SESSION_TYPES.length - 1 ? "1px solid var(--border)" : "none",
                          background: active ? "var(--primary)" : "transparent",
                          color: active ? "var(--bg)" : "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: active ? 800 : 650,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {activeGroupId ? (
                  (() => {
                    const group = groups.find((entry) => entry.id === activeGroupId);
                    return group ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 700 }}>{group.name}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>grupo ativo</span>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <select className="select" value={addForm.groupId} onChange={(event) => setAddForm((form) => ({ ...form, groupId: event.target.value, subject: "" }))}>
                    <option value="">Grupo</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.emoji} {group.name}</option>
                    ))}
                  </select>
                )}

                {addForm.groupId && (
                  formSubjects.length === 0 ? (
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Nenhuma matéria neste grupo.</p>
                  ) : (
                    <select className="select" value={addForm.subject} onChange={(event) => setAddForm((form) => ({ ...form, subject: event.target.value }))}>
                      <option value="">Matéria</option>
                      {formSubjects.map((subject) => (
                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                      ))}
                    </select>
                  )
                )}

                {addForm.subject && (
                  <Field label="Descrição - capítulos, foco, metas...">
                    <textarea className="input" style={{ resize: "none" }} value={addForm.description} onChange={(event) => setAddForm((form) => ({ ...form, description: event.target.value }))} />
                  </Field>
                )}

                <button onClick={addItem} disabled={!addForm.groupId || !addForm.subject} className="btn btn-ghost" style={{ width: "100%" }}>
                  <Plus style={{ width: 15, height: 15 }} /> Adicionar
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setDayModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={saveDayPlan} className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {doneModal && (
        <div className="modal-overlay" onClick={() => setDoneModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            {(() => {
              const group = groups.find((entry) => entry.id === doneModal.item.groupId);
              const type = SESSION_TYPE_LABELS[doneModal.item.sessionType];
              return (
                <ModalTitle
                  title={doneModal.item.subject}
                  description={`${type.label}${group ? ` - ${group.name}` : ""}`}
                  onClose={() => setDoneModal(null)}
                />
              );
            })()}

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", flex: 1 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10 }}>Quanto tempo você estudou?</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <TimeInput value={doneForm.hours} suffix="h" onChange={(value) => setDoneForm((form) => ({ ...form, hours: value }))} />
                  <MinuteSelect value={doneForm.minutes} onChange={(value) => setDoneForm((form) => ({ ...form, minutes: value }))} />
                </div>
              </div>

              <Field label="Anotações (opcional)">
                <textarea className="input" style={{ resize: "none" }} value={doneForm.notes} onChange={(event) => setDoneForm((form) => ({ ...form, notes: event.target.value }))} />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, padding: "16px 24px 20px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setDoneModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={registerDone} disabled={!canRegisterDone} className="btn btn-primary" style={{ flex: 1 }}>Registrar</button>
            </div>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            {(() => {
              const group = groups.find((entry) => entry.id === detailModal.item.groupId);
              const type = SESSION_TYPE_LABELS[detailModal.item.sessionType];
              const date = parseLocal(detailModal.date);

              return (
                <>
                  <ModalTitle
                    title={detailModal.item.subject}
                    description={`${type.label}${group ? ` - ${group.name}` : ""} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
                    onClose={() => setDetailModal(null)}
                  />

                  <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                      <div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 3 }}>Tempo estudado</p>
                        <p style={{ fontSize: 22, fontWeight: 850, color: "#059669", letterSpacing: -0.4 }}>
                          {detailModal.actualMin !== undefined ? formatDuration(detailModal.actualMin) : "-"}
                        </p>
                      </div>
                      <div style={{ width: 1, height: 38, background: "var(--border)" }} />
                      <div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 3 }}>Data</p>
                        <p style={{ fontSize: 15, fontWeight: 750, color: "var(--text-primary)" }}>
                          {date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>

                    {detailModal.notes ? (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>Anotações</p>
                        <p style={{ fontSize: 14, color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{detailModal.notes}</p>
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
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

function ModalTitle({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  return (
    <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 850, letterSpacing: -0.25, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </h2>
          {description && <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 3 }}>{description}</p>}
        </div>
        <button onClick={onClose} style={{ ...styles.closeButton, flexShrink: 0 }} aria-label="Fechar">
          <X style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}

function TimeInput({ value, suffix, onChange }: { value: string; suffix: string; onChange: (value: string) => void }) {
  return (
    <div style={{ flex: 1, position: "relative" }}>
      <input
        type="number"
        min="0"
        max="23"
        className="input"
        style={{ textAlign: "center", paddingRight: 30 }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", pointerEvents: "none", fontWeight: 700 }}>
        {suffix}
      </span>
    </div>
  );
}

function MinuteSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ flex: 1, position: "relative" }}>
      <input
        type="number"
        min="0"
        max="59"
        className="input"
        style={{ textAlign: "center", paddingRight: 36 }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", pointerEvents: "none", fontWeight: 700 }}>
        min
      </span>
    </div>
  );
}
