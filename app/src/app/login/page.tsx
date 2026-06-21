"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import "./login.css";

function traduz(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/user already registered/i.test(msg)) return "Esse e-mail já tem conta. Tente entrar.";
  if (/password should be at least/i.test(msg))
    return "A senha precisa de pelo menos 6 caracteres.";
  if (/email not confirmed/i.test(msg))
    return "Confirme seu e-mail antes de entrar (ou desligue a confirmação no painel).";
  return msg;
}

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [googleCarregando, setGoogleCarregando] = useState(false);

  const criando = modo === "criar";

  async function autenticar() {
    setCarregando(true);
    setErro(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await (criando
      ? supabase.auth.signUp({ email, password: senha })
      : supabase.auth.signInWithPassword({ email, password: senha }));
    setCarregando(false);

    if (error) {
      setErro(traduz(error.message));
      return;
    }
    if (criando && !data.session) {
      setErro("Conta criada. Confirme o e-mail (ou desligue a confirmação no painel) e entre.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  async function entrarComGoogle() {
    setGoogleCarregando(true);
    setErro(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/` },
    });
    if (error) {
      setErro("Erro ao entrar com Google. (Precisa configurar o provedor no Supabase.)");
      setGoogleCarregando(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    autenticar();
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-mark">
            <Icon name="grad" className="icon" />
          </div>
          <h1 className="auth-title">Cognix</h1>
          <p className="auth-sub">
            {criando
              ? "Crie sua conta para começar"
              : "Entre com suas credenciais para acessar"}
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-pass">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type={verSenha ? "text" : "password"}
              autoComplete={criando ? "new-password" : "current-password"}
              placeholder={criando ? "mínimo 6 caracteres" : "sua senha"}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              className="eye"
              aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setVerSenha((v) => !v)}
            >
              <Icon name={verSenha ? "eye-off" : "eye"} className="icon sm" />
            </button>
          </div>

          {!criando && (
            <div className="auth-row">
              <span
                className="auth-check"
                onClick={() => setLembrar((v) => !v)}
                role="checkbox"
                aria-checked={lembrar}
              >
                <span className={lembrar ? "box on" : "box"}>
                  {lembrar && <Icon name="check" className="icon" />}
                </span>
                Lembrar-me
              </span>
              <a className="auth-link" href="#">
                Esqueceu a senha?
              </a>
            </div>
          )}

          {erro && <div className="auth-error">{erro}</div>}

          <Button
            variant="primary"
            type="submit"
            className="auth-submit"
            disabled={carregando}
          >
            {carregando ? "..." : criando ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <div className="auth-divider">
          <span className="ln" />
          <span>ou continue com</span>
          <span className="ln" />
        </div>

        <Button
          variant="default"
          className="auth-google"
          onClick={entrarComGoogle}
          disabled={googleCarregando}
        >
          <GoogleIcon />
          {googleCarregando ? "..." : "Continuar com Google"}
        </Button>

        <p className="auth-foot">
          {criando ? "Já tem conta?" : "Não tem conta?"}
          <button
            type="button"
            onClick={() => {
              setModo(criando ? "entrar" : "criar");
              setErro(null);
            }}
          >
            {criando ? "Entrar" : "Criar agora"}
          </button>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
