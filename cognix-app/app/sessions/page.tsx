"use client";

import { useState } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { useStore, Session } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";

interface FormData {
  subject: string;
  durationMin: number;
  date: string;
  notes: string;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const emptyForm: FormData = { subject: "", durationMin: 60, date: todayStr(), notes: "" };

export default function SessionsPage() {
  const { sessions, addSession, deleteSession } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  const totalMin = sessions.reduce((a, s) => a + s.durationMin, 0);
  const totalH = Math.floor(totalMin / 60);
  const totalM = totalMin % 60;

  function handleSave() {
    if (!form.subject.trim()) return;
    addSession(form);
    setShowModal(false);
    setForm(emptyForm);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessões de Estudo</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sessions.length} sessão{sessions.length !== 1 ? "ões" : ""} · {totalH}h {totalM}m totais
          </p>
        </div>
        <button
          onClick={() => { setForm({ ...emptyForm, date: todayStr() }); setShowModal(true); }}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Sessão
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BookOpen className="w-14 h-14 text-gray-200 mb-4" />
          <p className="font-medium text-gray-500">Nenhuma sessão registrada</p>
          <p className="text-sm mt-1">Registre suas sessões de estudo para acompanhar seu progresso</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} onDelete={deleteSession} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Nova Sessão de Estudo</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors"
                  placeholder="Ex: Matemática"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos) *</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
                    value={form.durationMin}
                    onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anotações</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none transition-colors"
                  rows={3}
                  placeholder="O que você estudou? Dificuldades?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  disabled={!form.subject.trim()}
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

function SessionCard({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) {
  const dateFormatted = new Date(session.date + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-all">
      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
        <BookOpen className="w-5 h-5 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-800">{session.subject}</p>
          <button
            onClick={() => onDelete(session.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-purple-600 font-medium">{formatMinutes(session.durationMin)}</span>
          <span className="text-xs text-gray-400">{dateFormatted}</span>
        </div>
        {session.notes && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{session.notes}</p>}
      </div>
    </div>
  );
}
