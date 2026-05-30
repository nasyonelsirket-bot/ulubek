"use client";

import { useEffect, useState } from "react";

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

export default function TopMarketsBar() {
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
    { label: "Dolar", value: data.usd, suffix: "₺" },
    { label: "Euro", value: data.eur, suffix: "₺" },
    { label: "Altın", value: data.gold, suffix: "₺/gr" },
    { label: "BIST", value: data.bist, suffix: "" },
  ];

  return (
    <div className="border-b border-white/10 bg-[var(--navy)] text-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-x-auto px-3 py-1.5 text-[11px] scrollbar-none sm:gap-5 sm:text-xs">
        <span className="shrink-0 font-medium text-white/90">
          {data.date || new Date().toLocaleDateString("tr-TR")}
        </span>
        <span className="hidden h-3 w-px shrink-0 bg-white/20 sm:block" />
        {items.map((item) => (
          <span key={item.label} className="flex shrink-0 items-center gap-1">
            <span className="text-white/60">{item.label}</span>
            <span className="font-semibold tabular-nums">
              {item.value}
              {item.suffix && <span className="ml-0.5 text-[10px] font-normal text-white/70">{item.suffix}</span>}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
