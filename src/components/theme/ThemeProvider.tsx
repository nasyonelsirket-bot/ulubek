"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  mounted: false,
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("ulubek-theme", "light");
    setMounted(true);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", mounted, toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
