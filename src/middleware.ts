import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware — védi a /foglalas útvonalat.
 * Ha a felhasználó nincs bejelentkezve, visszairányít a főoldalra.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // FONTOS: Ne kerüljön kód a createServerClient és a getUser() hívás közé.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ADMIN_EMAIL = "info@vrsbillboards.hu";
  const path = request.nextUrl.pathname;

  // /foglalas — a dashboard maga kezeli az auth gate-et (AuthModal),
  // ezért itt NEM irányítjuk át, csak frissítjük a session cookie-t.

  // /admin — kizárólag az admin e-mail-nek engedélyezett
  if (path.startsWith("/admin")) {
    if (!user || user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Minden útvonalra fusson, kivéve:
     * - _next/static (statikus fájlok)
     * - _next/image (képoptimalizálás)
     * - favicon.ico, képek, ikonok
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
