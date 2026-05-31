"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field, Btn } from "@/components/ui";

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "", color: "transparent" },
    { label: "Fraca", color: "#ef4444" },
    { label: "Razoável", color: "#f59e0b" },
    { label: "Boa", color: "#3b82f6" },
    { label: "Forte", color: "#10b981" },
  ];
  return { score, ...levels[score] };
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  color: "white",
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    setLoading(false);
    if (authError) { setError(translateError(authError.message)); return; }
    if (data.session) { router.push("/dashboard"); router.refresh(); return; }
    setSuccess(true);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { setError("Erro ao entrar com Google. Tente novamente."); setGoogleLoading(false); }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div style={{ borderRadius: 20, padding: "40px 32px", textAlign: "center", maxWidth: 360, width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 style={{ width: 30, height: 30, color: "#10b981" }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 8 }}>Conta criada!</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
            Enviamos um e-mail de confirmação para <strong style={{ color: "white" }}>{email}</strong>.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ display: "flex", width: "100%" }}>
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-[400px]">
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "36px 32px" }}>

          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <GraduationCap style={{ width: 24, height: 24, color: "white" }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: -0.4 }}>Criar conta</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Comece sua jornada de estudos agora</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nome">
              <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
            </Field>

            <Field label="E-mail">
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            </Field>

            <div>
              <div style={{ position: "relative" }}>
                <Field label="Senha">
                  <input className="input" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: 44 }} />
                </Field>
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, display: "flex" }}>
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength.score ? strength.color : "rgba(255,255,255,0.1)", transition: "background 0.2s" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <Field label="Confirmar senha">
                <input className="input" type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required
                  style={{ ...inputStyle, paddingRight: 44, borderColor: confirm && confirm !== password ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)" }} />
              </Field>
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, display: "flex" }}>
                {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            {error && (
              <div style={{ borderRadius: 10, padding: "12px 14px", fontSize: 13, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <Btn type="submit" loading={loading} fullWidth style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", marginTop: 4 }}>
              {loading ? "" : "Criar conta"}
            </Btn>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", color: "#475569" }}>ou continue com</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          <button onClick={handleGoogle} disabled={googleLoading} className="btn btn-ghost"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#e2e8f0" }}>
            {googleLoading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <GoogleIcon />}
            Continuar com Google
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 20 }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ fontWeight: 600, color: "#7c3aed", textDecoration: "none" }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function translateError(msg: string): string {
  if (msg.includes("User already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be")) return "A senha deve ter pelo menos 6 caracteres.";
  if (msg.includes("Too many requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Erro ao criar conta. Tente novamente.";
}
