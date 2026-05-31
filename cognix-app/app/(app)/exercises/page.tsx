"use client";

import { useState } from "react";
import { Code2, Star, CheckCircle, Sparkles, Send, ChevronRight } from "lucide-react";
import { useStore, useGroupData, Exercise, Difficulty } from "@/lib/store";
import { cn } from "@/lib/utils";

const LANGUAGES = ["JavaScript","TypeScript","Python","Java","C","C++","Go","Rust","PHP","Ruby","Swift","Kotlin"];
const DIFFS: { key: Difficulty; label: string; bg: string; text: string }[] = [
  { key: "beginner",     label: "Iniciante",     bg: "var(--color-success-bg)", text: "var(--color-success-text)" },
  { key: "intermediate", label: "Intermediário", bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" },
  { key: "advanced",     label: "Avançado",      bg: "var(--color-danger-bg)",  text: "var(--color-danger-text)"  },
];

const diffStyle = (d: Difficulty) => DIFFS.find((x) => x.key === d)!;

export default function ExercisesPage() {
  const { addExercise, updateExercise } = useStore();
  const { exercises, activeGroupId } = useGroupData();
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ language: "JavaScript", difficulty: "beginner" as Difficulty, topic: "" });
  const [generating, setGenerating] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const done = exercises.filter((e) => e.status === "done").length;

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1400));
    addExercise({
      title: `Exercício de ${genForm.topic || genForm.language}`,
      language: genForm.language, difficulty: genForm.difficulty,
      topicTags: genForm.topic ? [genForm.topic] : ["lógica"],
      description: `Escreva um programa em ${genForm.language} que demonstre o conceito de ${genForm.topic || "lógica de programação"}. O programa deve receber entradas, processá-las e exibir o resultado correto.`,
      starterCode: `// Escreva seu código aqui\n`,
      status: "pending", isStarred: false, groupId: activeGroupId,
    });
    setGenerating(false);
    setShowGenModal(false);
    setGenForm({ language: "JavaScript", difficulty: "beginner", topic: "" });
  }

  function selectEx(ex: Exercise) {
    setSelected(ex);
    setUserCode(ex.userCode ?? ex.starterCode ?? "");
  }

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const updated = { ...selected, status: "done" as const, userCode, feedback: "Ótimo trabalho! Código bem estruturado. Continue praticando para consolidar o conceito." };
    updateExercise(selected.id, { status: "done", userCode, feedback: updated.feedback });
    setSelected(updated);
    setSubmitting(false);
  }

  return (
    <div className="exercises-wrap flex h-full">
      {/* Left panel */}
      <div className="exercises-side w-72 flex flex-col shrink-0" style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold text-slate-800">Exercícios</p>
            <p className="text-xs text-slate-400 mt-0.5">{done}/{exercises.length} concluídos</p>
          </div>
          <button onClick={() => setShowGenModal(true)} className="btn btn-primary" style={{ padding: "7px 12px", fontSize: "12px" }}>
            <Sparkles className="w-3.5 h-3.5" /> Gerar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Code2 className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">Nenhum exercício</p>
              <p className="text-xs text-slate-300 mt-0.5">Gere um com IA para começar</p>
            </div>
          ) : (
            exercises.map((ex) => {
              const ds = diffStyle(ex.difficulty);
              const active = selected?.id === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => selectEx(ex)}
                  className="w-full text-left p-3 rounded-xl transition-all duration-150"
                  style={{
                    border: active ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                    background: active ? "var(--primary-subtle)" : "var(--surface)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-500">{ex.language}</span>
                    <div className="flex items-center gap-1">
                      {ex.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      {ex.status === "done" && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 leading-tight line-clamp-2">{ex.title}</p>
                  <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full" style={{ background: ds.bg, color: ds.text }}>
                    {ds.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--primary-subtle)" }}>
              <Code2 className="w-9 h-9" style={{ color: "var(--primary-subtle-text)" }} />
            </div>
            <p className="text-base font-semibold text-slate-700">Selecione um exercício</p>
            <p className="text-sm text-slate-400 mt-1 text-center max-w-xs">Escolha um da lista ou gere um novo com IA para começar a praticar</p>
            <button onClick={() => setShowGenModal(true)} className="btn btn-primary mt-5">
              <Sparkles className="w-4 h-4" /> Gerar Exercício
            </button>
          </div>
        ) : (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ background: "var(--surface-subtle)", color: "var(--text-secondary)" }}>{selected.language}</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: diffStyle(selected.difficulty).bg, color: diffStyle(selected.difficulty).text }}>
                    {diffStyle(selected.difficulty).label}
                  </span>
                  {selected.status === "done" && (
                    <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)" }}>
                      <CheckCircle className="w-3 h-3" /> Concluído
                    </span>
                  )}
                </div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">{selected.title}</h1>
              </div>
              <button
                onClick={() => updateExercise(selected.id, { isStarred: !selected.isStarred })}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Star className={cn("w-5 h-5", selected.isStarred ? "text-amber-400 fill-amber-400" : "text-slate-300")} />
              </button>
            </div>

            <div className="card p-4 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Enunciado</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selected.description}</p>
              {selected.topicTags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {selected.topicTags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--primary-subtle)", color: "var(--primary-subtle-text)" }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#1e1e2e" }}>
                <span className="text-xs text-slate-500 font-mono">solution.{selected.language.toLowerCase().replace(/\+/g, "p")}</span>
                <div className="flex gap-1.5">
                  {["#ff5f57","#febc2e","#28c840"].map((c) => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <textarea
                className="w-full font-mono text-sm p-4 resize-none outline-none min-h-52 block"
                style={{ background: "#1e1e2e", color: "#cdd6f4", caretColor: "#cdd6f4" }}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="// Escreva seu código aqui..."
                spellCheck={false}
              />
            </div>

            {selected.feedback && (
              <div className="rounded-xl p-4 mb-4 flex gap-3" style={{ background: "var(--color-success-bg)", border: "1px solid rgba(34,197,94,0.25)" }}>
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 mb-0.5">Feedback da IA</p>
                  <p className="text-sm text-emerald-700">{selected.feedback}</p>
                </div>
              </div>
            )}

            {selected.status !== "done" && (
              <button onClick={handleSubmit} disabled={submitting || !userCode.trim()} className="btn btn-primary">
                {submitting
                  ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Avaliando...</>
                  : <><ChevronRight className="w-4 h-4" /> Enviar Solução</>}
              </button>
            )}
          </div>
        )}
      </div>

      {showGenModal && (
        <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "var(--primary-subtle-text)" }} />
                <h2 className="text-base font-semibold text-slate-900">Gerar Exercício com IA</h2>
              </div>
              <button onClick={() => setShowGenModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Linguagem</label>
                <select className="select" value={genForm.language} onChange={(e) => setGenForm({ ...genForm, language: e.target.value })}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Dificuldade</label>
                <select className="select" value={genForm.difficulty} onChange={(e) => setGenForm({ ...genForm, difficulty: e.target.value as Difficulty })}>
                  {DIFFS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tópico <span className="font-normal text-slate-400">(opcional)</span></label>
                <input className="input" placeholder="Ex: loops, recursão, arrays..." value={genForm.topic} onChange={(e) => setGenForm({ ...genForm, topic: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowGenModal(false)} className="btn btn-ghost flex-1">Cancelar</button>
              <button onClick={handleGenerate} disabled={generating} className="btn btn-primary flex-1">
                {generating
                  ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Gerando...</>
                  : <><Sparkles className="w-4 h-4" /> Gerar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
