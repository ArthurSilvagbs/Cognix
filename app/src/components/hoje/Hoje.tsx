"use client";

import { useEffect, useState } from "react";
import type {
  Alternativa,
  DadosHoje,
  Detalhe,
  FocoView,
  ItemHoje,
} from "@/domain/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { PageHead } from "../ui/PageHead";
import { SectionHeading } from "../ui/SectionHeading";
import { Toast, type ToastState } from "../ui/Toast";
import "./hoje.css";
import { Banner } from "./Banner";
import { EmptyHoje } from "./EmptyHoje";
import { FilaItemRow } from "./FilaItemRow";
import { Hero, type HeroMode } from "./Hero";
import { SideColumn } from "./SideColumn";

// Placeholder do "próximo da fila": só é lido no caminho de fila populada, que
// ainda não é alcançável (sem camada de agendamento). Vira dado real na fatia
// que preenche a fila em getDadosHoje().
const proximoInicial = { titulo: "", caminho: "", minutos: 0 };

let _seq = 0;
const uid = () => `g${++_seq}`;

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const RESUMO_INICIAL = (
  <>
    <b>2 estudos</b> (~1h10) · <b>2 revisões</b> · 2 planos ativos
  </>
);
const RESUMO_REPLANEJADO = (
  <>
    <b>3 estudos</b> (~1h45) · <b>3 revisões</b> · replanejado agora
  </>
);
const FIM = { sessoes: "3", horas: "1h35", revisoes: "2/2" };

/** T1 "Hoje" — a home (execução, não dashboard). Toda a coreografia do
 * protótipo portada para estado React. As escolhas (Focar, Antecipar, Adiar)
 * nunca mexem em datas; só Replanejar move datas (regra de ouro). */
export function Hoje({ dados }: { dados: DadosHoje }) {
  const [heroMode, setHeroMode] = useState<HeroMode>("idle");
  const [foco, setFoco] = useState<FocoView>(dados.foco);
  const [doneNote, setDoneNote] = useState("");

  const [fila, setFila] = useState<ItemHoje[]>(dados.fila);
  const [alternativas, setAlternativas] = useState<Alternativa[]>(dados.alternativas);
  const [pendencias, setPendencias] = useState(dados.pendencias);
  const [detalhes, setDetalhes] = useState<Detalhe[]>(dados.detalhes);

  const [bannerVisible, setBannerVisible] = useState(dados.pendencias.length > 0);
  const [bannerTitulo, setBannerTitulo] = useState("Ontem ficou pendente.");
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  const [timerSegundos, setTimerSegundos] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [duracao, setDuracao] = useState(40);
  const [anotacoes, setAnotacoes] = useState("");

  const [daySummary, setDaySummary] = useState<React.ReactNode>(RESUMO_INICIAL);
  const [toast, setToast] = useState<ToastState | null>(null);

  // cronômetro: corre só enquanto está em "timer" e não pausado
  useEffect(() => {
    if (heroMode !== "timer" || pausado) return;
    const t = setInterval(() => setTimerSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [heroMode, pausado]);

  const visiveis = fila.filter((i) => !i.oculto);
  const feitos = visiveis.filter((i) => i.feito).length;
  // Nada a fazer hoje: a tela é uma projeção dos dados — sem dados, estado vazio.
  const diaVazio = fila.length === 0 && pendencias.length === 0;

  const showToast = (msg: string, undo?: () => void) => setToast({ msg, undo });

  // ---------- Foco móvel: mover o foco nunca reordena nem muda datas ----------
  function focar(item: ItemHoje, reason: string) {
    setFila((prev) =>
      prev.map((i) => (i.tipo === "estudo" ? { ...i, emFoco: i.id === item.id } : i)),
    );
    setFoco({ titulo: item.titulo, caminho: item.caminho, reason, minutos: item.minutos });
    setHeroMode("idle");
  }

  function onFocarBtn(item: ItemHoje) {
    focar(item, "Escolha sua — a ordem é recomendação, não obrigação.");
    showToast(`${item.titulo} em foco. A ordem e as datas continuam as mesmas.`);
  }

  // ---------- Antecipar: troca o FOCO, nunca as datas ----------
  function antecipar(alt: Alternativa) {
    const anterior = fila.find((i) => i.emFoco && !i.feito)?.titulo ?? null;
    const novo: ItemHoje = {
      id: uid(),
      tipo: "estudo",
      titulo: alt.titulo,
      caminho: alt.caminho,
      minutos: alt.minutos,
      meta: `Estudo · ${alt.materia} · ~${alt.minutos} min · antecipado de amanhã`,
      emFoco: true,
    };
    setFila((prev) => [
      novo,
      ...prev.map((i) => (i.tipo === "estudo" ? { ...i, emFoco: false } : i)),
    ]);
    setAlternativas((prev) => prev.filter((a) => a.id !== alt.id));
    setFoco({
      titulo: alt.titulo,
      caminho: alt.caminho,
      reason: "Escolha sua — o plano se ajusta, não reclama.",
      minutos: alt.minutos,
    });
    setHeroMode("idle");
    showToast(
      `${alt.titulo} antecipado, em foco agora.${
        anterior ? ` ${anterior} segue na fila de hoje —` : ""
      } nenhuma data mudou.`,
    );
  }

  // ---------- Revisão: revisar conclui e encadeia (R1); adiar = A3 ----------
  function revisar(id: string) {
    const it = fila.find((i) => i.id === id);
    setFila((prev) =>
      prev.map((i) => (i.id === id ? { ...i, feito: true, emFoco: false } : i)),
    );
    if (it) showToast(`Próxima revisão de ${it.titulo}: ${it.prox}.`);
  }

  function adiar(id: string) {
    const it = fila.find((i) => i.id === id);
    setFila((prev) => prev.map((i) => (i.id === id ? { ...i, oculto: true } : i)));
    if (it)
      showToast(`Revisão de ${it.titulo} adiada para amanhã.`, () =>
        setFila((prev) => prev.map((i) => (i.id === id ? { ...i, oculto: false } : i))),
      );
  }

  // ---------- F3: replanejar aplica direto + desfazer (A2 + R3) ----------
  function replanejar() {
    setBannerVisible(false);
    const nova: ItemHoje = {
      id: "rep",
      tipo: "revisao",
      titulo: "Juros Simples",
      caminho: "BB 2026 › Matemática",
      minutos: 0,
      meta: "Revisão 3 de 3 · Matemática · reancorada de ontem",
      prox: "+7 dias (18/06)",
    };
    setFila((prev) => [...prev, nova]);
    setDaySummary(RESUMO_REPLANEJADO);
    showToast("Replanejado: 2 estudos deslizados · 1 revisão trazida para hoje.", () => {
      setBannerVisible(true);
      setFila((prev) => prev.filter((i) => i.id !== "rep"));
      setDaySummary(RESUMO_INICIAL);
    });
  }

  // ---------- "Estudar o de ontem": puxa pro foco, não resolve a pendência ----------
  function estudarOntem() {
    const prox = pendencias[0];
    if (!prox) return;
    const novo: ItemHoje = {
      id: uid(),
      tipo: "estudo",
      titulo: prox.titulo,
      caminho: "BB 2026 › Matemática",
      minutos: 35,
      meta: prox.meta,
      emFoco: true,
    };
    setFila((prev) => [
      novo,
      ...prev.map((i) => (i.tipo === "estudo" ? { ...i, emFoco: false } : i)),
    ]);
    setFoco({
      titulo: prox.titulo,
      caminho: "BB 2026 › Matemática",
      reason: "Era o estudo de ontem — retomado por sua escolha.",
      minutos: 35,
    });
    setHeroMode("idle");
    setPendencias((prev) => prev.slice(1));
    setDetalhes((prev) =>
      prev.map((d) =>
        d.titulo === prox.titulo
          ? { ...d, status: "foco", chipText: "em foco agora" }
          : d,
      ),
    );
    setDetalhesAbertos(true);
    const restam = pendencias.length - 1 + 1; // estudos restantes + 1 revisão
    setBannerTitulo(
      restam === 1 ? "Ainda há 1 pendência de ontem." : `Ainda há ${restam} pendências de ontem.`,
    );
    showToast(`${prox.titulo} em foco. O restante de ontem continua no banner.`);
  }

  // ---------- Hero: máquina de estados + timer ----------
  function iniciar() {
    setTimerSegundos(0);
    setPausado(false);
    setHeroMode("timer");
  }

  function concluir() {
    const focado = fila.find((i) => i.emFoco && i.tipo === "estudo" && !i.feito);
    if (focado)
      setFila((prev) =>
        prev.map((i) => (i.id === focado.id ? { ...i, feito: true, emFoco: false } : i)),
      );
    setDoneNote(`${foco.titulo} concluído · 1ª revisão amanhã (12/06)`);
    setHeroMode("done");
    showToast("Revisões agendadas: amanhã (12/06) · depois +7d e +21d.");
  }

  const heroProps = {
    mode: heroMode,
    foco,
    next: proximoInicial,
    doneNote,
    timerDisplay: fmt(timerSegundos),
    pausado,
    duracao,
    anotacoes,
    onDuracao: setDuracao,
    onAnotacoes: setAnotacoes,
    fim: FIM,
    onIniciar: iniciar,
    onRegistrarSemTimer: () => {
      setDuracao(40);
      setHeroMode("form");
    },
    onPausar: () => setPausado((p) => !p),
    onEncerrar: () => {
      setDuracao(Math.max(1, Math.round(timerSegundos / 60)));
      setHeroMode("form");
    },
    onCancelar: () => {
      setHeroMode("idle");
      showToast("Sessão descartada — nada foi registrado.");
    },
    onConclui: concluir,
    onAindaEstudando: () => {
      setHeroMode("idle");
      showToast(`Sessão de ${duracao} min registrada. O tópico segue em estudo.`);
    },
    onIniciarProximo: () => {
      setFoco({
        titulo: proximoInicial.titulo,
        caminho: proximoInicial.caminho,
        reason: "Próximo na sua ordem — nada vencido antes dele.",
        minutos: proximoInicial.minutos,
      });
      iniciar();
    },
    onEncerrarDia: () => setHeroMode("fim"),
    onMaisUma: () => {
      setFoco({ ...foco, titulo: "Porcentagem" });
      setHeroMode("idle");
    },
  };

  if (diaVazio) {
    return (
      <>
        <PageHead kicker="Quinta-feira, 11 de junho" title="Hoje" />
        <EmptyHoje temPlanos={dados.temPlanos} />
      </>
    );
  }

  return (
    <>
      <PageHead kicker="Quinta-feira, 11 de junho" title="Hoje" summary={daySummary} />

      <div className="layout">
        <div className="col-main">
          <Banner
            visible={bannerVisible}
            titulo={bannerTitulo}
            detalhes={detalhes}
            aberto={detalhesAbertos}
            estudarOntemVisible={pendencias.length > 0}
            onToggle={() => setDetalhesAbertos((a) => !a)}
            onReplanejar={replanejar}
            onEstudarOntem={estudarOntem}
          />

          <Hero {...heroProps} />

          <SectionHeading count={`${feitos} de ${visiveis.length}`}>
            Fila de hoje
          </SectionHeading>
          <Card>
            <div>
              {visiveis.map((it, ix) => (
                <FilaItemRow
                  key={it.id}
                  item={it}
                  displayNum={it.feito ? "✓" : String(ix + 1)}
                  onFocar={() => onFocarBtn(it)}
                  onRevisar={() => revisar(it.id)}
                  onAdiar={() => adiar(it.id)}
                />
              ))}
            </div>
            <div className="meta-dim" style={{ paddingTop: "var(--s3)" }}>
              A fila se reorganiza sozinha quando algo muda — sem dever de casa de
              planejamento.
            </div>
          </Card>

          <SectionHeading>Se não estiver no clima</SectionHeading>
          <Card>
            {alternativas.map((a) => (
              <div className="item" key={a.id}>
                <div>
                  <div className="title-md">{a.titulo}</div>
                  <div className="meta-dim">
                    {a.materia} · ~{a.minutos} min
                  </div>
                </div>
                <Button size="sm" onClick={() => antecipar(a)}>
                  Antecipar
                </Button>
              </div>
            ))}
            <div className="meta-dim" style={{ paddingTop: "var(--s3)" }}>
              Antecipar não bagunça o plano — o item vem pro seu foco agora e a data
              original só é cumprida mais cedo.
            </div>
          </Card>
        </div>

        <SideColumn />
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
