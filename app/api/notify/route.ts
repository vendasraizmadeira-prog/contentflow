import { createAdminClient, createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";
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

  // In-app notifications
  const rows = targets.map((uid) => ({
    user_id: uid,
    title,
    message: message ?? null,
    type: type ?? "general",
    url: url ?? null,
  }));
  await supabase.from("notifications").insert(rows);

  // Push notifications
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", targets);

  const expiredIds: string[] = [];
  await Promise.all(
    (subs ?? []).map(async (sub) => {
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title, body: message ?? "", url: url ?? "/" }
      );
      if (result === "expired") expiredIds.push(sub.id);
    })
  );
  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  return NextResponse.json({ ok: true });
}
