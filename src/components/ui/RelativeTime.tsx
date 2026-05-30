"use client";

import { useEffect, useState } from "react";
import { getRelativeTime } from "@/lib/utils/time";
import { formatDateStable, toIsoString } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

interface RelativeTimeProps {
  date: string | Date;
  className?: string;
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  const iso = toIsoString(date);
  const [text, setText] = useState(() => formatDateStable(date));

  useEffect(() => {
    setText(getRelativeTime(date));
    const timer = setInterval(() => setText(getRelativeTime(date)), 60_000);
    return () => clearInterval(timer);
  }, [iso, date]);

  return (
    <time dateTime={iso} className={cn(className)} suppressHydrationWarning>
      {text}
    </time>
  );
}
