import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
  //   const { data: salao } = await supabase
  //     .from("saloes")
  //     .select("ativo")
  //     .eq("id", user.id)
  //     .single();

  //   const isActive = (salao as { ativo: boolean } | null)?.ativo ?? false;

  //   if (!isActive && request.nextUrl.pathname !== "/assinar") {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/assinar";
  //     return NextResponse.redirect(url);
  //   }
  // }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/assinar"],
};
