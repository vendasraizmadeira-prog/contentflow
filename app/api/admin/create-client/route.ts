import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { name, instagram, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  // Use service role to create user without email confirmation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Erro ao criar usuário." }, { status: 400 });
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authData.user.id,
    role: "client",
    name,
    instagram: instagram || "",
    avatar: "",
    bio: "",
    website: "",
    followers: 0,
    following: 0,
    posts: 0,
    growth: 0,
    warmth_score: 0,
    briefing_completed: false,
  }, { onConflict: "id" });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    id: authData.user.id,
    name,
    instagram: instagram || "",
    email,
  });
}
