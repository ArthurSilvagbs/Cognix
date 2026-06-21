import { AppShell } from "@/components/AppShell";
import { NovoPlanoWizard } from "./NovoPlanoWizard";
import "../planos.css";

// T6 — Novo plano. O conteúdo do wizard é estreito (640px), como no protótipo.
export default function NovoPlanoPage() {
  return (
    <AppShell active="planos">
      <div style={{ maxWidth: 640 }}>
        <NovoPlanoWizard />
      </div>
    </AppShell>
  );
}
