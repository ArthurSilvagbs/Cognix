import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase para uso no SERVIDOR (Server Components, route handlers,
// server actions). Lê/grava a sessão do usuário via cookies da requisição.
// No Next 16, cookies() é assíncrono — por isso esta função é async.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Em Server Components puros, escrever cookie lança — ignoramos.
          // Em server actions / route handlers a escrita funciona.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // noop — ignorado fora de action/route handler
          }
        },
      },
    },
  );
}
