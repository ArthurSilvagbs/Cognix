import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para uso no NAVEGADOR (Client Components). Só usa a chave
// anon, que é pública por design — a segurança vem das policies (RLS) no banco.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
