"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { criarPlanoManual } from "../actions";

// T6 — Novo plano (wizard). Passo 1: escolher o modo. "Montar na mão" cria um
// rascunho vazio (server action) e cai na tela do plano. "Criar com IA" abre o
// passo 2 (conteúdo) — a geração em si é a próxima fatia, então o botão fica
// honestamente desativado (sem fingir um rascunho, que seria mock).
export function NovoPlanoWizard() {
  const [passo, setPasso] = useState<1 | 2>(1);

  const titulo = passo === 1 ? "Como o conteúdo chega?" : "Conteúdo e contexto";

  return (
    <>
      <div className="page-kicker">Novo plano</div>
      <h1>{titulo}</h1>

      <div className="passos" aria-hidden="true">
        <div className={`p ${passo >= 1 ? "on" : ""}`}>
          <span className="dot">1</span> Modo
        </div>
        <div className="lig" />
        <div className={`p ${passo >= 2 ? "on" : ""}`}>
          <span className="dot">2</span> Conteúdo
        </div>
        <div className="lig" />
        <div className="p">
          <span className="dot">3</span> Rascunho
        </div>
      </div>

      {passo === 1 ? (
        <>
          <div className="modos">
            <button type="button" className="modo" onClick={() => setPasso(2)}>
              <Icon name="doc" className="icon" />
              <div className="title-md">Criar com IA</div>
              <div className="meta">
                Cole um edital, uma lista solta ou só diga o objetivo — e anexe PDFs se
                tiver. A IA detecta o que é, completa as lacunas e organiza a estrutura.
              </div>
              <div className="ex">
                ex.: &quot;Edital BB 2026&quot;, &quot;cai português e mat. financeira&quot;,
                &quot;quero aprender integrais&quot;
              </div>
            </button>

            <form action={criarPlanoManual} style={{ display: "contents" }}>
              <button type="submit" className="modo">
                <Icon name="hand" className="icon" />
                <div className="title-md">Montar na mão</div>
                <div className="meta">
                  Estrutura vazia, sem IA — matérias e tópicos do seu jeito, com os mesmos
                  poderes.
                </div>
                <div className="ex">caminho de primeira classe, não um plano B</div>
              </button>
            </form>
          </div>
          <div className="meta-dim" style={{ marginTop: "var(--s4)" }}>
            Os dois caminhos terminam no mesmo lugar: um <b>rascunho 100% editável</b>. A IA
            escreve o rascunho; você é o dono.
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <label htmlFor="conteudo">Cole o edital, a lista ou descreva o objetivo</label>
            <textarea
              id="conteudo"
              rows={7}
              placeholder='Ex.: cole o edital inteiro · "cai português, matemática financeira e atualidades" · "quero aprender integrais do zero"'
            />

            <div className="dropzone">
              <Icon name="doc" className="icon sm" />
              <span>
                Tem o PDF do edital? <b>Arraste aqui</b> ou clique para anexar — a IA lê junto.
              </span>
            </div>

            <div className="perg">
              <div className="field">
                <label htmlFor="dataAlvo">
                  Data da prova ou meta <span className="opt">opcional</span>
                </label>
                <input type="date" id="dataAlvo" className="tnum" />
              </div>
              <div className="field">
                <label htmlFor="tempo">Tempo por dia</label>
                <input
                  id="tempo"
                  type="text"
                  value="seg–sex 1h · sáb–dom 3h"
                  readOnly
                  style={{ color: "var(--ink-500)" }}
                />
                <div className="field-hint">
                  Vem do seu perfil. <a href="#">Ajustar em Configurações →</a>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--s3)", marginTop: "var(--s5)", alignItems: "center" }}>
              <Button variant="primary" disabled title="Disponível na próxima fatia">
                Gerar rascunho com IA
              </Button>
              <span className="modo em-breve">em breve</span>
              <Button variant="ghost" onClick={() => setPasso(1)}>
                ← Voltar
              </Button>
            </div>
            <div className="meta-dim" style={{ marginTop: "var(--s3)" }}>
              A geração por IA é a próxima fatia. Por enquanto, use <b>Montar na mão</b> para
              criar o plano e adicionar matérias e tópicos você mesmo.
            </div>
          </div>
        </>
      )}
    </>
  );
}
