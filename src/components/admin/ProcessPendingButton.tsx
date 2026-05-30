"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessPendingButtonProps {
  pendingCount: number;
}

export default function ProcessPendingButton({ pendingCount }: ProcessPendingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (pendingCount === 0) return null;

  async function handleProcess() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/cron/ai-process?limit=50", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(`${data.success} haber AI ile işlendi, ${data.failed} hata`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-medium text-purple-900">
            {pendingCount} haber AI işlemesi bekliyor
          </p>
          <p className="text-sm text-purple-700">
            Bekleyen haberleri analiz et, kategorize et ve yayınla
          </p>
        </div>
        <Button
          onClick={handleProcess}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Sparkles className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
          {loading ? "İşleniyor..." : "AI ile İşle"}
        </Button>
      </div>
      {message && <p className="mt-2 text-sm text-purple-800">{message}</p>}
    </div>
  );
}
