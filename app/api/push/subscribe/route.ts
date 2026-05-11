import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint, p256dh, auth } = await req.json();
  if (!endpoint || !p256dh || !auth)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = await createAdminClient();
  await supabase.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint, p256dh, auth },
    { onConflict: "user_id,endpoint" }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json();
  const supabase = await createAdminClient();
  await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
