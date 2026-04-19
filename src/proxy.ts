import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy — védi az /admin útvonalat.
 * (Next.js 16: middleware.ts → proxy.ts, function middleware → proxy)
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) {
    console.error("[proxy] Hiányzik NEXT_PUBLIC_SUPABASE_URL vagy NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnon,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
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

  // /profil és /partner — csak bejelentkezett felhasználóknak
  if ((path.startsWith("/profil") || path.startsWith("/partner")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // /admin — kizárólag az admin e-mail-nek engedélyezett
  // /admin/login kivétel: a belépési oldalt mindenki elérheti
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!user || user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
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
