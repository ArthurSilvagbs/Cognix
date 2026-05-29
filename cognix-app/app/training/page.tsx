"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, Eye, EyeOff, Sparkles, CheckCircle } from "lucide-react";
import { useStore, Difficulty } from "@/lib/store";
import { cn } from "@/lib/utils";

type Phase = "setup" | "memorize" | "write" | "result";

const LANGUAGES = ["Python","JavaScript","TypeScript","Java","C","C++","Go","Rust"];
const DIFFS: { key: Difficulty; label: string }[] = [
  { key: "beginner", label: "Iniciante" },
  { key: "intermediate", label: "Intermediário" },
  { key: "advanced", label: "Avançado" },
];

const MOCK: Record<Difficulty, string[]> = {
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

resultado = fatorial(5)
print(f"5! = {resultado}")`,
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
        return len(self.items) == 0

    def peek(self):
        if not self.is_empty():
            return self.items[-1]`,
  ],
  advanced: [
`def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left   = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right  = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

nums = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(nums))`,
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "memorize" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); setPhase("write"); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    const pool = MOCK[difficulty];
    setCurrentCode(pool[Math.floor(Math.random() * pool.length)]);
    setUserCode(""); setTimeLeft(memorizeSec); setPhase("memorize");
    setGenerating(false);
  }

  async function handleSubmit() {
    const orig = currentCode.replace(/\s+/g, " ").trim();
    const written = userCode.replace(/\s+/g, " ").trim();
    const origW = orig.split(" "); const writtenW = new Set(written.split(" "));
    const matches = origW.filter((w) => writtenW.has(w)).length;
    const s = Math.round((matches / origW.length) * 100);
    const fb = s >= 90 ? "Excelente! Memorização quase perfeita. 🎉"
      : s >= 70 ? "Muito bom! Você captou bem a estrutura do código."
      : s >= 50 ? "Bom progresso. Foque nos detalhes sintáticos na próxima."
      : "Continue praticando. Tente memorizar a estrutura primeiro.";
    setScore(s); setFeedback(fb);
    addTraining({ language, difficulty, topic, originalCode: currentCode, userCode, score: s, feedback: fb, memorizeSec });
    setPhase("result");
  }

  const pct = (timeLeft / memorizeSec) * 100;
  const scoreColor = score >= 80 ? "#15803d" : score >= 50 ? "#b45309" : "#b91c1c";
  const scoreBg = score >= 80 ? "#f0fdf4" : score >= 50 ? "#fffbeb" : "#fef2f2";

  return (
    <div className="p-7 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
          <RefreshCw className="w-4 h-4" style={{ color: "#d97706" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Treino de Memorização</h1>
          <p className="text-sm text-slate-400">Veja o código, memorize e reescreva — a IA avalia sua resposta</p>
        </div>
      </div>

      {phase === "setup" && (
        <div className="card p-6">
          {/* How it works */}
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl" style={{ background: "#faf5ff", border: "1px solid #ede9fe" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#ede9fe" }}>
              <Eye className="w-4 h-4" style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Como funciona</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {["IA gera código", "Você memoriza", "Reescreve de memória", "Recebe feedback"].map((s, i) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">{s}</span>
                    {i < 3 && <span className="text-slate-300 text-xs">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Linguagem</label>
              <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Dificuldade</label>
              <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                {DIFFS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tópico <span className="font-normal text-slate-400">(opcional)</span></label>
              <input className="input" placeholder="Ex: loops, funções..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tempo para memorizar (s)</label>
              <input type="number" min={10} max={300} className="input" value={memorizeSec} onChange={(e) => setMemorizeSec(Number(e.target.value))} />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="btn btn-primary w-full" style={{ padding: "12px" }}>
            {generating
              ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Gerando código...</>
              : <><Sparkles className="w-4 h-4" /> Gerar Código para Memorizar</>}
          </button>
        </div>
      )}

      {phase === "memorize" && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-800">Memorize este código</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-xl font-bold tabular-nums", timeLeft <= 10 ? "text-red-500" : "text-slate-800")}>{timeLeft}s</span>
                <button onClick={() => { clearInterval(timerRef.current!); setPhase("write"); }} className="text-xs text-slate-400 hover:text-slate-600 underline">Pronto</button>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "#f1f5f9" }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: timeLeft <= 10 ? "#ef4444" : "#7c3aed" }} />
            </div>
            <pre className="text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre p-4 rounded-xl" style={{ background: "#1e1e2e", color: "#cdd6f4" }}>
              {currentCode}
            </pre>
          </div>
        </div>
      )}

      {phase === "write" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-amber-800 font-medium">Código escondido.</span>
            <span className="text-amber-700">Reescreva o que você memorizou!</span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#1e1e2e" }}>
              <span className="text-xs text-slate-500 font-mono">sua_resposta</span>
              <div className="flex gap-1.5">
                {["#ff5f57","#febc2e","#28c840"].map((c) => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
              </div>
            </div>
            <textarea
              className="w-full font-mono text-sm p-4 resize-none outline-none min-h-56 block"
              style={{ background: "#1e1e2e", color: "#cdd6f4", caretColor: "#cdd6f4" }}
              value={userCode} onChange={(e) => setUserCode(e.target.value)}
              placeholder="// Reescreva o código de memória..."
              spellCheck={false} autoFocus
            />
          </div>
          <button onClick={handleSubmit} disabled={!userCode.trim()} className="btn btn-primary w-full" style={{ padding: "12px" }}>
            Avaliar Resposta
          </button>
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: scoreBg }}>
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}%</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{score >= 80 ? "Excelente!" : score >= 60 ? "Bom trabalho!" : "Continue praticando!"}</p>
                <p className="text-sm text-slate-500 mt-0.5">{feedback}</p>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: "#f1f5f9" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: scoreColor }} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl p-3" style={{ background: "#f8fafc" }}>
                <p className="text-xs text-slate-400 mb-0.5">Linguagem</p>
                <p className="font-semibold text-slate-700">{language}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#f8fafc" }}>
                <p className="text-xs text-slate-400 mb-0.5">Dificuldade</p>
                <p className="font-semibold text-slate-700">{DIFFS.find((d) => d.key === difficulty)?.label}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Original", code: currentCode }, { label: "Sua resposta", code: userCode }].map(({ label, code }) => (
              <div key={label} className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                <div className="px-3 py-2" style={{ background: "#1e1e2e" }}>
                  <span className="text-xs text-slate-500 font-mono">{label}</span>
                </div>
                <pre className="text-xs font-mono p-3 overflow-x-auto whitespace-pre-wrap" style={{ background: "#1e1e2e", color: "#cdd6f4" }}>{code}</pre>
              </div>
            ))}
          </div>

          <button onClick={() => { setPhase("setup"); setCurrentCode(""); setUserCode(""); setScore(0); setFeedback(""); }} className="btn btn-primary w-full" style={{ padding: "12px" }}>
            <RefreshCw className="w-4 h-4" /> Treinar Novamente
          </button>
        </div>
      )}
    </div>
  );
}
