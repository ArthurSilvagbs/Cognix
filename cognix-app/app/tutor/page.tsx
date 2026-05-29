"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

const SUGGESTIONS = [
  "O que é recursão?",
  "Como funciona o Big O Notation?",
  "Explique herança em POO",
  "Diferença entre SQL e NoSQL",
  "O que é uma closure em JavaScript?",
  "Como funciona o garbage collector?",
];

const MOCK_RESPONSES: Record<string, string> = {
  default: `Ótima pergunta! Vou te ajudar com isso.

Esta é uma área importante da programação. Aqui estão os pontos principais:

**Conceito:** É fundamental entender os princípios básicos antes de avançar.

**Exemplo prático:**
\`\`\`python
def exemplo():
    # Este é um exemplo simples
    return "Olá, mundo!"
\`\`\`

**Dicas:**
- Pratique regularmente
- Resolva exercícios variados
- Revise os conceitos com frequência

Tem alguma dúvida específica sobre isso? 😊`,
};

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou o Tutor IA do Cognix. Pode me perguntar sobre qualquer tema de estudo — programação, matemática, ciências e muito mais. Como posso te ajudar hoje?",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    const response = MOCK_RESPONSES.default;
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response, ts: new Date() };
    setMessages((m) => [...m, aiMsg]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base">Tutor IA</h1>
            <p className="text-xs text-gray-500">Pergunte sobre qualquer matéria</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === "user" ? "bg-purple-700" : "bg-purple-100"
            )}>
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <div className={cn(
              "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-purple-700 text-white rounded-tr-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
            )}>
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              <p className={cn("text-xs mt-1", msg.role === "user" ? "text-white/60" : "text-gray-400")}>
                {msg.ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only when just welcome message) */}
      {messages.length === 1 && (
        <div className="px-6 pb-3">
          <p className="text-xs text-gray-400 mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          <input
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            placeholder="Pergunte qualquer coisa..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">Powered by Claude AI · Pressione Enter para enviar</p>
      </div>
    </div>
  );
}
