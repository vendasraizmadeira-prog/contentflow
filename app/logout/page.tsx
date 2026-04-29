"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    createClient().auth.signOut().then(() => router.push("/"));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0F" }}>
      <p className="text-sm" style={{ color: "#6B7280" }}>Saindo...</p>
    </div>
  );
}
