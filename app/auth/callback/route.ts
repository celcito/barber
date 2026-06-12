import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_PATHS = [
  "/dashboard",
  "/dashboard/agenda",
  "/dashboard/agenda-profissionais",
  "/dashboard/clientes",
  "/dashboard/configuracoes",
  "/dashboard/profissionais",
  "/dashboard/servicos",
  "/assinar",
];

function isValidRedirectPath(path: string): boolean {
  if (!path || !path.startsWith("/")) return false;
  if (ALLOWED_PATHS.includes(path)) return true;
  if (path.startsWith("/dashboard/")) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = isValidRedirectPath(nextParam) ? nextParam : "/dashboard";

  if (code) {
    const supabaseResponse = NextResponse.redirect(`${origin}${next}`);

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
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return supabaseResponse;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
