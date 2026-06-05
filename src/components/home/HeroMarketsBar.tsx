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

const FALLBACK: MarketData = {
  date: "",
  usd: "—",
  eur: "—",
  gold: "—",
  bist: "—",
};

const trends = [true, false, true, true] as const;

export default function HeroMarketsBar() {
  const [data, setData] = useState<MarketData>(FALLBACK);

  useEffect(() => {
    fetch("/api/markets")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        setData({
          date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
          usd: "32.45",
          eur: "35.18",
          gold: "2.845",
          bist: "9.842",
        });
      });
  }, []);

  const items = [
    { label: "DOLAR", value: data.usd, suffix: "₺", up: trends[0] },
    { label: "EURO", value: data.eur, suffix: "₺", up: trends[1] },
    { label: "ALTIN", value: data.gold, suffix: "₺/gr", up: trends[2] },
    { label: "BIST 100", value: data.bist, suffix: "", up: trends[3] },
  ];

  return (
    <div className="mt-2 border border-border bg-[#f4f4f4]">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 overflow-x-auto px-3 py-2 text-[11px] scrollbar-none sm:gap-6 sm:text-xs">
        <span className="shrink-0 font-semibold text-[var(--navy)]">
          {data.date || new Date().toLocaleDateString("tr-TR")}
        </span>
        <span className="hidden h-4 w-px shrink-0 bg-border sm:block" />
        {items.map((item) => (
          <span key={item.label} className="flex shrink-0 items-center gap-1.5">
            <span className="font-bold text-[var(--navy)]">{item.label}</span>
            <span className="font-semibold tabular-nums text-[var(--navy)]">
              {item.value}
              {item.suffix && <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{item.suffix}</span>}
            </span>
            {item.up ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-600" aria-hidden />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
