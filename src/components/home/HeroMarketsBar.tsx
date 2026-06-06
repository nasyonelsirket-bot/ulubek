"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MarketData {
  date: string;
  usd: string;
  eur: string;
  gold: string;
  bist: string;
}

const FALLBACK: MarketData = { date: "", usd: "—", eur: "—", gold: "—", bist: "—" };
const trends = [true, false, true, true] as const;

export default function HeroMarketsBar() {
  const [data, setData] = useState<MarketData>(FALLBACK);

  useEffect(() => {
    fetch("/api/markets")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        setData({
          date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
          usd: "32.45",
          eur: "35.18",
          gold: "2.845",
          bist: "9.842",
        });
      });
  }, []);

  const items = [
    { label: "💵 Dolar", value: data.usd, suffix: "₺", up: trends[0] },
    { label: "💶 Euro", value: data.eur, suffix: "₺", up: trends[1] },
    { label: "🥇 Altın", value: data.gold, suffix: "₺", up: trends[2] },
    { label: "📈 BIST", value: data.bist, suffix: "", up: trends[3] },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 text-sm scrollbar-none md:gap-6">
        <span className="shrink-0 text-xs font-bold text-muted-foreground">{data.date}</span>
        {items.map((item) => (
          <span key={item.label} className="flex shrink-0 items-center gap-1.5 font-semibold text-[var(--navy)]">
            {item.label}
            <span className="tabular-nums">
              {item.value}
              {item.suffix}
            </span>
            {item.up ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
