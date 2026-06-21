"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Encerra a sessão e volta pro login. */
export function SignOutButton() {
  const router = useRouter();

  async function sair() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="nav-item"
      onClick={sair}
      style={{ width: "100%", background: "none", border: "none", cursor: "pointer", font: "inherit" }}
    >
      Sair
    </button>
  );
}
