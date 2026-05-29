"use client";

import { useState } from "react";
import { Code2, Star, CheckCircle, Sparkles, ChevronRight } from "lucide-react";
import { useStore, Exercise, Difficulty } from "@/lib/store";
import { cn } from "@/lib/utils";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C", "C++", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"];
const DIFFICULTIES: { key: Difficulty; label: string; color: string }[] = [
  { key: "beginner", label: "Iniciante", color: "bg-green-100 text-green-700" },
  { key: "intermediate", label: "Intermediário", color: "bg-yellow-100 text-yellow-700" },
  { key: "advanced", label: "Avançado", color: "bg-red-100 text-red-700" },
];

interface GenerateForm {
  language: string;
  difficulty: Difficulty;
  topic: string;
}

export default function ExercisesPage() {
  const { exercises, addExercise, updateExercise } = useStore();
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState<GenerateForm>({ language: "JavaScript", difficulty: "beginner", topic: "" });
  const [generating, setGenerating] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const done = exercises.filter((e) => e.status === "done").length;

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));

    const mockExercise: Omit<Exercise, "id" | "createdAt"> = {
      title: `Exercício de ${genForm.topic || genForm.language}`,
      language: genForm.language,
      difficulty: genForm.difficulty,
      topicTags: genForm.topic ? [genForm.topic] : ["lógica"],
      description: `Escreva um programa em ${genForm.language} que demonstre o conceito de ${genForm.topic || "lógica de programação"}. O programa deve ler dados de entrada, processá-los e exibir o resultado.`,
      starterCode: `// Escreva seu código aqui\n`,
      status: "pending",
      isStarred: false,
    };

    addExercise(mockExercise);
    setGenerating(false);
    setShowGenModal(false);
    setGenForm({ language: "JavaScript", difficulty: "beginner", topic: "" });
  }

  function handleSelectExercise(ex: Exercise) {
    setSelected(ex);
    setUserCode(ex.userCode ?? ex.starterCode ?? "");
  }

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateExercise(selected.id, {
      status: "done",
      userCode,
      feedback: "Ótimo trabalho! Seu código está correto e bem estruturado. Continue praticando!",
    });
    setSelected({ ...selected, status: "done", userCode, feedback: "Ótimo trabalho! Seu código está correto e bem estruturado." });
    setSubmitting(false);
  }

  const diffColor = (d: Difficulty) => DIFFICULTIES.find((x) => x.key === d)?.color ?? "";
  const diffLabel = (d: Difficulty) => DIFFICULTIES.find((x) => x.key === d)?.label ?? d;

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Exercícios</h2>
            <p className="text-xs text-gray-500">{done}/{exercises.length} concluídos</p>
          </div>
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gerar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-center">
              <Code2 className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-xs">Nenhum exercício ainda</p>
            </div>
          ) : (
            exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelectExercise(ex)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all",
                  selected?.id === ex.id ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">{ex.language}</span>
                  <div className="flex items-center gap-1">
                    {ex.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                    {ex.status === "done" && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{ex.title}</p>
                <span className={cn("inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full", diffColor(ex.difficulty))}>
                  {diffLabel(ex.difficulty)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
              <Code2 className="w-9 h-9 text-purple-400" />
            </div>
            <p className="font-semibold text-gray-600 mb-1">Selecione um exercício</p>
            <p className="text-sm text-center max-w-xs">Escolha um exercício na lista ou gere um novo com IA para começar a praticar</p>
            <button
              onClick={() => setShowGenModal(true)}
              className="mt-4 flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Exercício
            </button>
          </div>
        ) : (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">{selected.language}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", diffColor(selected.difficulty))}>{diffLabel(selected.difficulty)}</span>
                  {selected.status === "done" && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Concluído
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{selected.title}</h1>
              </div>
              <button
                onClick={() => updateExercise(selected.id, { isStarred: !selected.isStarred })}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Star className={cn("w-5 h-5", selected.isStarred ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
              </button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Enunciado</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
              {selected.topicTags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {selected.topicTags.map((tag) => (
                    <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Code editor */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono">solution.{selected.language.toLowerCase()}</span>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
              <textarea
                className="w-full font-mono text-sm p-4 bg-gray-900 text-gray-100 resize-none outline-none min-h-48"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="// Escreva seu código aqui..."
                spellCheck={false}
              />
            </div>

            {/* Feedback */}
            {selected.feedback && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-green-800 mb-1">Feedback da IA</p>
                <p className="text-sm text-green-700">{selected.feedback}</p>
              </div>
            )}

            {selected.status !== "done" && (
              <button
                onClick={handleSubmit}
                disabled={submitting || !userCode.trim()}
                className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                {submitting ? (
                  <>Avaliando...</>
                ) : (
                  <><ChevronRight className="w-4 h-4" /> Enviar Solução</>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Gerar Exercício com IA</h2>
              </div>
              <button onClick={() => setShowGenModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Linguagem</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 bg-white"
                  value={genForm.language}
                  onChange={(e) => setGenForm({ ...genForm, language: e.target.value })}
                >
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 bg-white"
                  value={genForm.difficulty}
                  onChange={(e) => setGenForm({ ...genForm, difficulty: e.target.value as Difficulty })}
                >
                  {DIFFICULTIES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tópico (opcional)</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors"
                  placeholder="Ex: loops, funções, arrays..."
                  value={genForm.topic}
                  onChange={(e) => setGenForm({ ...genForm, topic: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowGenModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <><span className="animate-spin">⟳</span> Gerando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Gerar</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
