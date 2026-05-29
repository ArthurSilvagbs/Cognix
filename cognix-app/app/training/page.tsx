"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, Eye, EyeOff, Sparkles, CheckCircle, BookOpen } from "lucide-react";
import { useStore, Difficulty } from "@/lib/store";
import { cn } from "@/lib/utils";

type Phase = "setup" | "memorize" | "write" | "result";

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java", "C", "C++", "Go", "Rust"];
const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "beginner", label: "Iniciante" },
  { key: "intermediate", label: "Intermediário" },
  { key: "advanced", label: "Avançado" },
];

const MOCK_CODES: Record<Difficulty, string[]> = {
  beginner: [
    `def calcular_media(notas):
    total = sum(notas)
    return total / len(notas)

notas = [7.5, 8.0, 9.0, 6.5]
media = calcular_media(notas)
print(f"Média: {media:.2f}")`,
    `def fatorial(n):
    if n <= 1:
        return 1
    return n * fatorial(n - 1)

print(fatorial(5))  # 120`,
  ],
  intermediate: [
    `class Pilha:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()

    def is_empty(self):
        return len(self.items) == 0`,
  ],
  advanced: [
    `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`,
  ],
};

export default function TrainingPage() {
  const { addTraining } = useStore();
  const [phase, setPhase] = useState<Phase>("setup");
  const [language, setLanguage] = useState("Python");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [topic, setTopic] = useState("");
  const [memorizeSec, setMemorizeSec] = useState(30);
  const [generating, setGenerating] = useState(false);

  const [currentCode, setCurrentCode] = useState("");
  const [userCode, setUserCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "memorize" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setPhase("write");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    const codes = MOCK_CODES[difficulty];
    const code = codes[Math.floor(Math.random() * codes.length)];
    setCurrentCode(code);
    setUserCode("");
    setTimeLeft(memorizeSec);
    setPhase("memorize");
    setGenerating(false);
  }

  function handleSkipMemorize() {
    clearInterval(intervalRef.current!);
    setPhase("write");
  }

  async function handleSubmit() {
    const original = currentCode.replace(/\s+/g, " ").trim();
    const written = userCode.replace(/\s+/g, " ").trim();

    let matches = 0;
    const origWords = original.split(" ");
    const writtenWords = written.split(" ");
    origWords.forEach((word) => {
      if (writtenWords.includes(word)) matches++;
    });
    const s = Math.round((matches / origWords.length) * 100);
    setScore(s);

    const fb =
      s >= 90
        ? "Excelente! Você memorizou o código quase perfeitamente! 🎉"
        : s >= 70
        ? "Muito bom! Você captou a essência do código. Continue praticando!"
        : s >= 50
        ? "Bom progresso! Tente focar nos detalhes da sintaxe na próxima tentativa."
        : "Continue praticando! Tente memorizar a estrutura principal primeiro.";

    setFeedback(fb);
    addTraining({ language, difficulty, topic, originalCode: currentCode, userCode, score: s, feedback: fb, memorizeSec });
    setPhase("result");
  }

  function handleReset() {
    setPhase("setup");
    setCurrentCode("");
    setUserCode("");
    setScore(0);
    setFeedback("");
  }

  const timerPct = (timeLeft / memorizeSec) * 100;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <RefreshCw className="w-6 h-6 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treino de Memorização</h1>
          <p className="text-sm text-gray-500 mt-0.5">Veja o código, memorize e reescreva — o sistema avalia seu entendimento.</p>
        </div>
      </div>

      {phase === "setup" && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="font-semibold text-purple-900">Como funciona?</p>
              <p className="text-xs text-purple-600">A IA gera um código → você memoriza → reescreve de memória → recebe feedback</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linguagem</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-purple-500"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-purple-500"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                {DIFFICULTIES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tópico (opcional)</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-purple-500 transition-colors"
                placeholder="Ex: loops, funções..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo para memorizar (seg)</label>
              <input
                type="number"
                min={10}
                max={300}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-purple-500"
                value={memorizeSec}
                onChange={(e) => setMemorizeSec(Number(e.target.value))}
              />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {generating ? (
              <><span className="animate-spin inline-block">⟳</span> Gerando...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Gerar Código para Memorizar</>
            )}
          </button>
        </div>
      )}

      {phase === "memorize" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" />
                <p className="font-semibold text-gray-800">Memorize este código</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-lg font-bold", timeLeft <= 10 ? "text-red-500" : "text-purple-600")}>
                  {timeLeft}s
                </span>
                <button
                  onClick={handleSkipMemorize}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Pular
                </button>
              </div>
            </div>
            {/* Timer bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className={cn("h-full rounded-full transition-all", timeLeft <= 10 ? "bg-red-400" : "bg-purple-500")}
                style={{ width: `${timerPct}%` }}
              />
            </div>
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {currentCode}
            </pre>
          </div>
        </div>
      )}

      {phase === "write" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-800">O código foi escondido. Reescreva o que você memorizou!</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 bg-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">sua_resposta.{language.toLowerCase()}</span>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <textarea
              className="w-full font-mono text-sm p-4 bg-gray-900 text-gray-100 resize-none outline-none min-h-52"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="// Reescreva o código de memória..."
              spellCheck={false}
              autoFocus
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!userCode.trim()}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Avaliar Resposta
          </button>
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <CheckCircle className="w-14 h-14 text-purple-600 mx-auto mb-3" />
            <div className={cn("text-5xl font-bold mb-2", score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-500" : "text-red-500")}>
              {score}%
            </div>
            <p className="text-gray-500 text-sm mb-4">{feedback}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Linguagem</p>
                <p className="font-semibold text-gray-800">{language}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Dificuldade</p>
                <p className="font-semibold text-gray-800">{DIFFICULTIES.find(d => d.key === difficulty)?.label}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Original</p>
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">{currentCode}</pre>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Sua resposta</p>
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">{userCode}</pre>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Treinar Novamente
          </button>
        </div>
      )}
    </div>
  );
}
