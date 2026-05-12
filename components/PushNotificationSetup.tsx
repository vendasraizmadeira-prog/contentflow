"use client";
import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function subscribe() {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return false;

  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
  });

  const json = sub.toJSON();
  if (!json.keys?.p256dh || !json.keys?.auth) return false;
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }),
  });
  return true;
}

export default function PushNotificationSetup() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") {
      // Already granted — subscribe silently
      subscribe().catch(() => {});
      return;
    }
    if (Notification.permission === "default") {
      setShow(true);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const ok = await subscribe();
      if (ok) { setDone(true); setTimeout(() => setShow(false), 1500); }
      else setShow(false);
    } catch {
      setShow(false);
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: "#1C1C2E", border: "1px solid #7B4DFF40", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(123,77,255,0.15)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">Ativar notificações</p>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>Receba avisos sobre seus conteúdos</p>
      </div>
      {done ? (
        <span className="text-sm font-bold" style={{ color: "#4ade80" }}>✓</span>
      ) : (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShow(false)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ color: "#6B7280" }}
          >
            Agora não
          </button>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50"
            style={{ background: "#7B4DFF", color: "#fff" }}
          >
            {loading ? "..." : "Ativar"}
          </button>
        </div>
      )}
    </div>
  );
}
