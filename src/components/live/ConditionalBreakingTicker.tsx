"use client";

import { usePathname } from "next/navigation";
import LiveBreakingTicker from "./LiveBreakingTicker";

export default function ConditionalBreakingTicker() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <LiveBreakingTicker />;
}
