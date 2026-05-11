import { createAdminClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const now = new Date().toISOString();

  const { data: schedules } = await supabase
    .from("push_schedules")
    .select("id, client_id, title, message")
    .eq("sent", false)
    .lte("scheduled_at", now);

  if (!schedules || schedules.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const clientIds = [...new Set(schedules.map((s) => s.client_id))];
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", clientIds);

  const expiredIds: string[] = [];
  let sent = 0;

  for (const schedule of schedules) {
    const clientSubs = (subs ?? []).filter((s) => s.user_id === schedule.client_id);
    for (const sub of clientSubs) {
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title: schedule.title, body: schedule.message, url: "/dashboard" }
      );
      if (result === "expired") expiredIds.push(sub.id);
      else sent++;
    }
    await supabase
      .from("push_schedules")
      .update({ sent: true, sent_at: now })
      .eq("id", schedule.id);
  }

  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  return NextResponse.json({ processed: schedules.length, sent });
}
