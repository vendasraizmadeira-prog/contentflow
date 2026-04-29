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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Public routes — no auth needed
  if (
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/api/") ||
    path.startsWith("/_next") ||
    path === "/manifest.json" ||
    path === "/sw.js" ||
    path.match(/\.(png|ico|jpg|jpeg|svg|webp)$/)
  ) {
    return supabaseResponse;
  }

  // Not logged in → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("portal", path.startsWith("/admin") ? "admin" : "client");
    return NextResponse.redirect(url);
  }

  // Get the user's role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, briefing_completed")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // Admin routes require admin role
  if (path.startsWith("/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Client routes require client role
  if (!path.startsWith("/admin") && path !== "/" && role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Briefing gate: client hasn't completed briefing → force to /briefing
  if (
    role === "client" &&
    !profile?.briefing_completed &&
    !path.startsWith("/briefing") &&
    path !== "/logout"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/briefing";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icon-.*\\.png).*)",
  ],
};
