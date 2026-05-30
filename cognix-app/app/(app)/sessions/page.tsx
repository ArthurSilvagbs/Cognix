"use client";

import { useState } from "react";
import { Plus, Trash2, BookOpen, Clock, CalendarDays } from "lucide-react";
import { useStore, useGroupData, Session } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";

interface FormData { subject: string; durationMin: number; date: string; notes: string; }
const todayStr = () => new Date().toISOString().split("T")[0];
const EMPTY: FormData = { subject: "", durationMin: 60, date: todayStr(), notes: "" };

const SUBJECT_COLORS = ["#7c3aed","#0891b2","#059669","#d97706","#db2777","#4f46e5","#0284c7","#16a34a"];
function subjectColor(subject: string) {
  let h = 0;
  for (let i = 0; i < subject.length; i++) h = subject.charCodeAt(i) + ((h << 5) - h);
  return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length];
}

export default function SessionsPage() {
  const { addSession, deleteSession } = useStore();
  const { sessions, activeGroupId } = useGroupData();
  const { groups } = useStore();
  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);

  const totalMin = sessions.reduce((a, s) => a + s.durationMin, 0);

  function handleSave() {
    if (!form.subject.trim()) return;
    addSession({ ...form, groupId: activeGroupId });
    setShowModal(false);
    setForm({ ...EMPTY, date: todayStr() });
  }

  return (
    <div className="p-7 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sessões de Estudo</h1>
            {activeGroup && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${activeGroup.color}15`, color: activeGroup.color }}>
                {activeGroup.emoji} {activeGroup.name}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            <span className="text-slate-600 font-medium">{sessions.length}</span> sessão{sessions.length !== 1 ? "ões" : ""} ·{" "}
            <span className="text-slate-600 font-medium">{formatMinutes(totalMin)}</span> totais
          </p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY, date: todayStr() }); setShowModal(true); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nova Sessão
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--surface-subtle)" }}>
            <BookOpen className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-500">Nenhuma sessão registrada</p>
          <p className="text-sm text-slate-400 mt-1 text-center max-w-xs">Registre suas sessões de estudo para acompanhar seu progresso ao longo do tempo</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} onDelete={deleteSession} color={subjectColor(session.subject)} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-base font-semibold text-slate-900">Nova Sessão de Estudo</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Matéria *</label>
                <input className="input" placeholder="Ex: Matemática" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Duração (minutos) *</label>
                  <input type="number" min={1} className="input" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Data</label>
                  <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Anotações</label>
                <textarea className="input resize-none" rows={3} placeholder="O que você estudou? Dificuldades encontradas?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={!form.subject.trim()} className="btn btn-primary flex-1">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onDelete, color }: { session: Session; onDelete: (id: string) => void; color: string }) {
  const d = new Date(session.date + "T00:00:00");
  const dateFormatted = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="card flex items-center gap-4 px-4 py-3.5 hover:shadow-sm transition-all duration-150 group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <BookOpen className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{session.subject}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
            <Clock className="w-3 h-3" />
            {formatMinutes(session.durationMin)}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays className="w-3 h-3" />
            {dateFormatted}
          </span>
        </div>
        {session.notes && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{session.notes}</p>}
      </div>
      <button
        onClick={() => onDelete(session.id)}
        className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
