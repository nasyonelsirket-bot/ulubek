"use client";

import { useEffect, useState } from "react";
import { APP_TIMEZONE } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

function formatToday(): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: APP_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

interface ClientTodayProps {
  className?: string;
}

export default function ClientToday({ className }: ClientTodayProps) {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(formatToday());
    const timer = setInterval(() => setToday(formatToday()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <time className={cn(className)} suppressHydrationWarning>
      {today ?? "\u00a0"}
    </time>
  );
}
