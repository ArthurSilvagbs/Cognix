"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message { id: string; role: "user" | "assistant"; content: string; ts: Date; }

const SUGGESTIONS = [
  "O que é recursão?",
  "Como funciona Big O Notation?",
  "Explique herança em POO",
  "Diferença entre SQL e NoSQL",
  "O que é uma closure em JavaScript?",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "0", role: "assistant",
    content: "Olá! Sou o Tutor IA do Cognix. Pode me perguntar sobre qualquer tema de estudo — programação, matemática, ciências e muito mais.\n\nComo posso te ajudar hoje?",
    ts: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: msg, ts: new Date() }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100 + Math.random() * 500));

    const response = `Boa pergunta sobre **"${msg}"**!\n\nEsse é um conceito importante. Aqui estão os pontos principais:\n\n1. Entender o problema antes de codificar\n2. Quebrar em partes menores e mais simples\n3. Testar cada parte individualmente\n\nQuer que eu aprofunde algum aspecto específico?`;
    setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: "assistant", content: response, ts: new Date() }]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const showSuggestions = messages.length === 1;

  return (
    <div className="tutor-wrap flex flex-col h-full" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "var(--bg)" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Tutor IA</p>
            <p className="text-xs text-slate-400">Pergunte sobre qualquer matéria</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="max-w-3xl mx-auto px-6 space-y-5">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "user"
                  ? "bg-slate-900"
                  : "bg-white border border-slate-200"
              )}>
                {msg.role === "user"
                  ? <User className="w-4 h-4 text-white" />
                  : <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--primary-subtle-text)" }} />}
              </div>
              <div
                className={cn("max-w-[78%] px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm")}
                style={msg.role === "user"
                  ? { background: "var(--primary)", color: "var(--bg)" }
                  : { background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={cn("text-xs mt-1.5", msg.role === "user" ? "text-white/65" : "text-slate-400")}>
                  {msg.ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--primary-subtle-text)" }} />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="pb-2">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-xs text-slate-400 mb-2">Sugestões de perguntas</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors font-medium"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="pb-5 pt-3" style={{ background: "var(--bg)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
            style={{ background: "var(--surface)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
            onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgb(124 58 237 / 0.15)"; }}
            onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}
          >
            <input
              ref={inputRef}
              className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent"
              placeholder="Pergunte qualquer coisa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-300">
                <CornerDownLeft className="w-3 h-3" /> Enter
              </span>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: !input.trim() || loading ? "var(--surface-subtle)" : "var(--primary)" }}
              >
                <Send className="w-3.5 h-3.5" style={{ color: !input.trim() || loading ? "var(--text-muted)" : "var(--bg)" }} />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">Powered by Claude AI</p>
        </div>
      </div>
    </div>
  );
}
