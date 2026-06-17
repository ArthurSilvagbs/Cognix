// Home mínima — prova que o design system (wireframe.css) está vivo no app.
// Será substituída pela tela T1 "Hoje" na primeira fatia vertical.
export default function Home() {
  return (
    <main>
      <div className="page">
        <div className="page-head">
          <p className="page-kicker">Cognix v2</p>
          <h1>Design system no ar</h1>
          <p className="day-summary">
            Tokens, tipografia e componentes portados do protótipo —{" "}
            <b>modo escuro padrão</b>.
          </p>
        </div>

        <div className="card hero">
          <p className="title-xl">Scaffold + design system prontos</p>
          <p className="meta" style={{ marginTop: "var(--s2)" }}>
            Próximo passo: cliente Supabase e a fatia{" "}
            <b>ALIMENTAR → RECEBER</b>.
          </p>
          <div style={{ display: "flex", gap: "var(--s2)", marginTop: "var(--s4)" }}>
            <button className="btn primary">Ação primária</button>
            <button className="btn">Ação secundária</button>
            <span className="badge soft">índigo</span>
          </div>
        </div>
      </div>
    </main>
  );
}
