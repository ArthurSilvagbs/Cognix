import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept static assets or OAuth callback
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth/callback") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // If Supabase is not configured, allow everything through
  if (!supabaseUrl || supabaseUrl.includes("SEU_PROJETO") || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    const isAuthRoute =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/reset-password";

    if (!user && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // On any Supabase error, fail open so the app remains accessible
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
