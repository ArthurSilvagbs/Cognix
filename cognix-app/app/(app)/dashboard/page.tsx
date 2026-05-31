"use client";

import Link from "next/link";
import {
  ArrowRight, BookOpen, CalendarDays, CheckCircle2, CheckSquare,
  FolderOpen, MessageSquare, Plus, TrendingUp,
} from "lucide-react";
import { SESSION_TYPE_CONFIG, StudyPlanItem, useStore } from "@/lib/store";
import { formatDate, getGreeting } from "@/lib/utils";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function priorityWeight(priority: string) {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function PanelHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.2, textTransform: "uppercase", color: "var(--text-primary)" }}>{title}</h2>
        {eyebrow && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{eyebrow}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyBlock({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div style={{ padding: "34px 20px", textAlign: "center" }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-subtle)", color: "var(--text-muted)" }}>
        <Icon style={{ width: 21, height: 21 }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 650, color: "var(--text-primary)" }}>{title}</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{subtitle}</p>
    </div>
  );
}

function PlannedSessionRow({ item, color }: { item: StudyPlanItem; color: string }) {
  const type = SESSION_TYPE_CONFIG[item.sessionType];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
      <span style={{ width: 4, height: 28, borderRadius: 99, background: color, flexShrink: 0 }} />
      <span style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}18`, fontSize: 15, flexShrink: 0 }}>{type.emoji}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 650, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.subject}</p>
        {item.description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</p>}
      </div>
      <span style={{ fontSize: 12, fontWeight: 650, color: "var(--text-secondary)", padding: "4px 8px", borderRadius: 99, background: "var(--surface-subtle)", border: "1px solid var(--border)", flexShrink: 0 }}>{type.label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const {
    groups, activeGroupId, tasks, subjects, sessions, planDays, planItems, user,
  } = useStore();

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;
  const isAllGroups = activeGroupId === null;
  const scopedTasks = isAllGroups ? tasks : tasks.filter((task) => task.groupId === activeGroupId);
  const scopedSubjects = isAllGroups ? subjects : subjects.filter((subject) => subject.groupId === activeGroupId);
  const scopedSessions = isAllGroups ? sessions : sessions.filter((session) => session.groupId === activeGroupId);
  const scopedPlanItems = isAllGroups ? planItems : planItems.filter((item) => item.groupId === activeGroupId);

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const todayDow = today.getDay();
  const orderedWeek = Array.from({ length: 7 }, (_, i) => (todayDow + i) % 7);
  const accent = activeGroup?.color ?? "#64748b";

  const pendingTasks = scopedTasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))
    .slice(0, 5);
  const doneTasks = scopedTasks.filter((task) => task.status === "done").length;
  const todaySessions = scopedSessions.filter((session) => session.date === todayKey);
  const studiedToday = todaySessions.reduce((acc, session) => acc + (session.actualMin ?? 0), 0);
  const totalStudied = scopedSessions.reduce((acc, session) => acc + (session.actualMin ?? 0), 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekDates = new Set(Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    return d.toISOString().split("T")[0];
  }));
  const studiedThisWeek = scopedSessions
    .filter((s) => weekDates.has(s.date))
    .reduce((acc, s) => acc + (s.actualMin ?? 0), 0);

  // Streak: dias consecutivos com sessão registrada (até hoje)
  let streak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (scopedSessions.some((s) => s.date === key)) streak++;
    else if (i > 0) break;
  }

  const planByDay = orderedWeek
    .map((dow, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        dow,
        date: d,
        planDay: planDays.find((day) => day.dayOfWeek === dow),
        items: scopedPlanItems.filter((item) => item.dayOfWeek === dow).sort((a, b) => a.position - b.position),
      };
    })
    .filter((day) => day.items.length > 0);
  const todayPlan = planByDay.find((day) => day.dow === todayDow);
  const nextPlan = planByDay.find((day) => day.dow !== todayDow);
  const focusPlan = todayPlan ?? nextPlan;

  const subjectProgress = scopedSubjects.map((subject) => {
    const subjectTasks = scopedTasks.filter((task) => task.subject === subject.name);
    const done = subjectTasks.filter((task) => task.status === "done").length;
    return { subject, total: subjectTasks.length, done };
  }).filter((item) => item.total > 0).slice(0, 5);

  const recentSessions = [...scopedSessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const completedSessions = scopedSessions.filter((s) => s.actualMin && s.actualMin > 0).length;

  const stats = [
    { label: "Sessões", value: completedSessions, sub: `${scopedSessions.length > 0 ? completedSessions : 0} registradas no total` },
    { label: "Hoje", value: studiedToday > 0 ? fmtDuration(studiedToday) : todayPlan ? fmtDuration(todayPlan.planDay?.plannedMin ?? 0) : "-", sub: studiedToday > 0 ? "estudado hoje" : todayPlan ? "planejado, não iniciado" : "sem sessão planejada" },
    { label: "Esta semana", value: studiedThisWeek > 0 ? fmtDuration(studiedThisWeek) : "-", sub: `${scopedSessions.filter((s) => weekDates.has(s.date)).length} sessões registradas` },
    { label: "Sequência", value: streak > 0 ? `${streak}d` : "-", sub: streak > 0 ? "dias consecutivos" : "nenhum dia ainda" },
  ];

  return (
    <div className="page-wrap" style={{ padding: 32, maxWidth: 1480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="dash-hero" style={{ background: `linear-gradient(135deg, ${accent}e0 0%, ${accent}70 100%)`, borderRadius: 18, padding: "28px 32px", color: "white", overflow: "hidden" }}>
        <div className="dash-hero-inner" style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", marginBottom: 26 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
            <div style={{ width: 58, height: 58, borderRadius: 17, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
              {activeGroup?.emoji ?? "📚"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="dash-hero-date" style={{ fontSize: 13, fontWeight: 750, letterSpacing: 0.7, textTransform: "uppercase", color: "rgba(255,255,255,0.72)", marginBottom: 5 }}>{formatDate(today)}</p>
              <h1 className="dash-hero-title" style={{ fontSize: 28, fontWeight: 850, lineHeight: 1.1 }}>
                {getGreeting()}!{activeGroup ? ` ${activeGroup.name}` : ""}
              </h1>
              <p className="dash-hero-desc" style={{ fontSize: 15, color: "rgba(255,255,255,0.78)", marginTop: 6 }}>
                {activeGroup ? activeGroup.description || "Resumo do grupo ativo" : "Resumo geral dos seus estudos"}
              </p>
            </div>
          </div>
          <div className="dash-hero-buttons" style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Link href="/tasks" className="btn" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)", color: "white", padding: "10px 16px" }}>
              <Plus style={{ width: 16, height: 16 }} /> Nova tarefa
            </Link>
            <Link href="/sessions" className="btn" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)", color: "white", padding: "10px 16px" }}>
              <CalendarDays style={{ width: 16, height: 16 }} /> Planejar
            </Link>
          </div>
        </div>

        <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <p style={{ fontSize: 24, fontWeight: 820, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.74)", marginTop: 5 }}>{stat.label}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", marginTop: 2 }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel>
            {(() => {
              const visibleDays = planByDay.slice(0, 3);
              const hasMore = planByDay.length > 3;
              return (
                <>
                  <PanelHeader
                    title="Sessões"
                    eyebrow={planByDay.length > 0 ? "Próximas sessões planejadas" : "Nenhuma sessão planejada"}
                    action={
                      hasMore
                        ? <Link href="/sessions" style={{ color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 650 }}>Ver todas <ArrowRight style={{ width: 13, height: 13 }} /></Link>
                        : <Link href="/sessions" style={{ color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 650 }}>Calendário <ArrowRight style={{ width: 13, height: 13 }} /></Link>
                    }
                  />
                  {visibleDays.length > 0 ? (
                    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                      {visibleDays.map((day) => (
                        <div key={day.dow} className="dash-session-row" style={{ display: "grid", gridTemplateColumns: "150px minmax(0, 1fr)", gap: 14, padding: 14, borderRadius: 12, background: "var(--surface-subtle)", border: "1px solid var(--border)", overflow: "hidden" }}>
                          <div style={{ borderRight: "1px solid var(--border)", paddingRight: 14 }}>
                            <p style={{ fontSize: 17, fontWeight: 850, color: "var(--text-primary)", lineHeight: 1 }}>{DAY_LABELS[day.dow]}</p>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{day.date.getDate()} de {MONTHS[day.date.getMonth()]}</p>
                            {day.dow === todayDow && <span style={{ display: "inline-flex", marginTop: 6, fontSize: 11, fontWeight: 750, letterSpacing: 0.5, textTransform: "uppercase", color: accent, padding: "3px 7px", borderRadius: 99, background: `${accent}18` }}>Hoje</span>}
                            {day.planDay && (
                              <p style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text-muted)", marginTop: 7 }}>
                                <CalendarDays style={{ width: 13, height: 13 }} /> {fmtDuration(day.planDay.plannedMin)}
                              </p>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                            {day.items.map((item) => (
                              <PlannedSessionRow key={item.id} item={item} color={groups.find((group) => group.id === item.groupId)?.color ?? accent} />
                            ))}
                          </div>
                        </div>
                      ))}
                      {hasMore && (
                        <Link href="/sessions" className="btn btn-ghost" style={{ alignSelf: "center", fontSize: 13 }}>
                          Ver todas as sessões <ArrowRight style={{ width: 13, height: 13 }} />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <EmptyBlock icon={CalendarDays} title="Sem rotina planejada" subtitle="Monte sua semana em Sessões." />
                  )}
                </>
              );
            })()}
          </Panel>

          <Panel>
            <PanelHeader
              title="Tarefas pendentes"
              eyebrow={pendingTasks.length > 0 ? "Próximas ações para destravar progresso" : "Tudo limpo por aqui"}
              action={<Link href="/tasks" style={{ color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 650 }}>Ver todas <ArrowRight style={{ width: 13, height: 13 }} /></Link>}
            />
            {pendingTasks.length > 0 ? (
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 9 }}>
                {pendingTasks.map((task) => {
                  const taskGroup = groups.find((group) => group.id === task.groupId);
                  const color = taskGroup?.color ?? accent;
                  return (
                    <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--surface-subtle)", border: "1px solid var(--border)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{task.subject}{taskGroup ? ` · ${taskGroup.name}` : ""}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 99, color: task.priority === "high" ? "var(--color-danger-text)" : task.priority === "medium" ? "var(--color-warning-text)" : "var(--color-success-text)", background: task.priority === "high" ? "var(--color-danger-bg)" : task.priority === "medium" ? "var(--color-warning-bg)" : "var(--color-success-bg)" }}>
                        {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyBlock icon={CheckCircle2} title="Tudo em dia" subtitle="Nenhuma tarefa pendente no contexto atual." />
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Progresso por matéria" eyebrow="Baseado nas tarefas cadastradas" action={<Link href="/evolution" style={{ color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 650 }}>Evolução <ArrowRight style={{ width: 13, height: 13 }} /></Link>} />
            {subjectProgress.length > 0 ? (
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {subjectProgress.map(({ subject, done, total }) => {
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={subject.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{subject.name}</span>
                        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 650 }}>{done}/{total} · {pct}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 99, background: "var(--surface-subtle)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: groups.find((group) => group.id === subject.groupId)?.color ?? accent }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyBlock icon={TrendingUp} title="Sem progresso por matéria" subtitle="Crie tarefas vinculadas às matérias para acompanhar." />
            )}
          </Panel>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel>
            <PanelHeader title="Contexto" eyebrow={isAllGroups ? "Visão geral" : "Grupo ativo"} />
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {(isAllGroups ? groups.slice(0, 5) : activeGroup ? [activeGroup] : []).map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12, background: "var(--surface-subtle)", border: "1px solid var(--border)", textDecoration: "none" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: `${group.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{group.emoji}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 750, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.name}</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{subjects.filter((subject) => subject.groupId === group.id).length} matérias</p>
                  </div>
                </Link>
              ))}
              {groups.length === 0 && <EmptyBlock icon={FolderOpen} title="Nenhum grupo" subtitle="Crie um grupo para organizar os estudos." />}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Atalhos" />
            <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { href: "/groups", label: "Grupos", icon: FolderOpen },
                { href: "/sessions", label: "Sessões", icon: CalendarDays },
                { href: "/tutor", label: "Tutor", icon: MessageSquare },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} style={{ minHeight: 78, padding: 12, borderRadius: 12, background: "var(--surface-subtle)", border: "1px solid var(--border)", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: 9, justifyContent: "center" }}>
                  <Icon style={{ width: 18, height: 18, color: "var(--text-muted)" }} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Registros recentes" eyebrow="Últimas sessões concluídas" />
            {recentSessions.length > 0 ? (
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 9 }}>
                {recentSessions.map((session) => (
                  <div key={session.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 12, background: "var(--surface-subtle)", border: "1px solid var(--border)" }}>
                    <BookOpen style={{ width: 17, height: 17, color: "var(--text-muted)", flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.subject}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{session.actualMin ? fmtDuration(session.actualMin) : fmtDuration(session.durationMin)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock icon={BookOpen} title="Sem registros" subtitle="Registre sessões para ver histórico aqui." />
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
