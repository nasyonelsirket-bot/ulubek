"use client";

import { Radio } from "lucide-react";
import { useLiveNews } from "@/components/live/LiveNewsProvider";
import { useMounted } from "@/hooks/useMounted";

interface LiveConnectedBadgeProps {
  variant?: "header" | "ticker";
}

export default function LiveConnectedBadge({ variant = "ticker" }: LiveConnectedBadgeProps) {
  const { connected, wsEnabled } = useLiveNews();
  const mounted = useMounted();

  if (!mounted || !wsEnabled || !connected) return null;

  if (variant === "header") {
    return <Radio className="h-3 w-3 animate-pulse" aria-hidden />;
  }

  return (
    <span className="flex items-center gap-1 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-medium uppercase">
      <Radio className="h-3 w-3 animate-pulse" />
      Canlı
    </span>
  );
}
