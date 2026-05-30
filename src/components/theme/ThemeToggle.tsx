"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, mounted, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent"
      aria-label={mounted && theme === "dark" ? "Açık moda geç" : "Koyu moda geç"}
      suppressHydrationWarning
    >
      {!mounted ? (
        <Moon className="h-4 w-4 opacity-0" aria-hidden />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
