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

  if (!user && request.nextUrl.pathname.startsWith("/foglalas")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    // Hozzáfűzzük a szándékolt útvonalat, hogy bejelentkezés után visszairányíthassuk
    url.searchParams.set("auth", "login");
    return NextResponse.redirect(url);
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
