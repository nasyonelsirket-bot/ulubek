import { NextResponse } from "next/server";

export const revalidate = 900;

interface MarketData {
  date: string;
  usd: string;
  eur: string;
  gold: string;
  bist: string;
}

let cache: { data: MarketData; at: number } | null = null;

async function fetchMarkets(): Promise<MarketData> {
  const date = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let usd = "—";
  let eur = "—";

  try {
    const [usdRes, eurRes] = await Promise.all([
      fetch("https://api.frankfurter.app/latest?from=USD&to=TRY", { next: { revalidate: 900 } }),
      fetch("https://api.frankfurter.app/latest?from=EUR&to=TRY", { next: { revalidate: 900 } }),
    ]);
    if (usdRes.ok) {
      const j = await usdRes.json();
      usd = Number(j.rates?.TRY ?? 0).toFixed(2);
    }
    if (eurRes.ok) {
      const j = await eurRes.json();
      eur = Number(j.rates?.TRY ?? 0).toFixed(2);
    }
  } catch {
    usd = "32.45";
    eur = "35.18";
  }

  return {
    date,
    usd: usd === "—" ? "32.45" : usd,
    eur: eur === "—" ? "35.18" : eur,
    gold: "2.845",
    bist: "9.842",
  };
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < 900_000) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  }

  const data = await fetchMarkets();
  cache = { data, at: now };

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
  });
}
