"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LiveArticle, LiveEvent } from "@/lib/live/types";
import { isWebSocketUrlEnabled, sanitizeWebSocketUrl } from "@/lib/live/config";

interface LiveNewsContextValue {
  connected: boolean;
  wsEnabled: boolean;
  breakingNews: LiveArticle[];
  latestNews: LiveArticle[];
  newBreakingId: string | null;
  prependLatest: (article: LiveArticle) => void;
  setInitialLatest: (articles: LiveArticle[]) => void;
}

const LiveNewsContext = createContext<LiveNewsContextValue | null>(null);

export function useLiveNews() {
  const ctx = useContext(LiveNewsContext);
  if (!ctx) throw new Error("useLiveNews must be used within LiveNewsProvider");
  return ctx;
}

export function useLiveNewsOptional() {
  return useContext(LiveNewsContext);
}

interface LiveNewsProviderProps {
  initialBreaking: LiveArticle[];
  websocketUrl?: string | null;
  children: ReactNode;
}

export default function LiveNewsProvider({
  initialBreaking,
  websocketUrl = null,
  children,
}: LiveNewsProviderProps) {
  const wsEnabled = isWebSocketUrlEnabled(websocketUrl);
  const [connected, setConnected] = useState(false);
  const [breakingNews, setBreakingNews] = useState<LiveArticle[]>(initialBreaking);
  const [latestNews, setLatestNews] = useState<LiveArticle[]>([]);
  const [newBreakingId, setNewBreakingId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breakingFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prependLatest = useCallback((article: LiveArticle) => {
    setLatestNews((prev) => {
      if (prev.some((a) => a.id === article.id)) return prev;
      return [article, ...prev];
    });
  }, []);

  const setInitialLatest = useCallback((articles: LiveArticle[]) => {
    setLatestNews(articles);
  }, []);

  const handleEvent = useCallback(
    (event: LiveEvent) => {
      if (event.type === "CONNECTED") {
        setConnected(true);
        return;
      }

      if (!event.article) return;

      if (event.type === "NEW_ARTICLE") {
        prependLatest(event.article);
      }

      if (event.type === "BREAKING_NEWS" || (event.type === "NEW_ARTICLE" && event.article.breaking)) {
        setBreakingNews((prev) => {
          if (prev.some((a) => a.id === event.article!.id)) return prev;
          return [event.article!, ...prev].slice(0, 20);
        });
        setNewBreakingId(event.article.id);
        if (breakingFlashTimer.current) clearTimeout(breakingFlashTimer.current);
        breakingFlashTimer.current = setTimeout(() => setNewBreakingId(null), 8000);
      }
    },
    [prependLatest]
  );

  const connect = useCallback(() => {
    const url = sanitizeWebSocketUrl(websocketUrl);
    if (!url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (msg) => {
        try {
          const event = JSON.parse(msg.data as string) as LiveEvent;
          handleEvent(event);
        } catch {
          // ignore invalid messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    } catch {
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, [handleEvent, websocketUrl]);

  useEffect(() => {
    if (!wsEnabled) return;

    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (breakingFlashTimer.current) clearTimeout(breakingFlashTimer.current);
      wsRef.current?.close();
    };
  }, [connect, wsEnabled]);

  return (
    <LiveNewsContext.Provider
      value={{
        connected,
        wsEnabled,
        breakingNews,
        latestNews,
        newBreakingId,
        prependLatest,
        setInitialLatest,
      }}
    >
      {children}
    </LiveNewsContext.Provider>
  );
}
