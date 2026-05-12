import webpush from "web-push";

export type PushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPush(
  subscription: PushSubscription,
  payload: { title: string; body: string; url?: string }
): Promise<"ok" | "expired"> {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return "ok";
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) return "expired";
    console.error("push send error", err);
    return "ok";
  }
}
