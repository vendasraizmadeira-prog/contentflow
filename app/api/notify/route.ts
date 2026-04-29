import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, targetRole, title, message, type, url } = await req.json();
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });
  if (!userId && !targetRole) return NextResponse.json({ error: "Missing target" }, { status: 400 });

  const supabase = await createAdminClient();

  let targets: string[] = [];
  if (userId) {
    targets = [userId];
  } else if (targetRole) {
    const { data: users } = await supabase.from("profiles").select("id").eq("role", targetRole);
    targets = (users ?? []).map((u: { id: string }) => u.id);
  }

  if (targets.length === 0) return NextResponse.json({ ok: true });

  const rows = targets.map((uid) => ({
    user_id: uid,
    title,
    message: message ?? null,
    type: type ?? "general",
    url: url ?? null,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
