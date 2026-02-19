import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createFinanceWS } from "@/lib/api";
import { useFinanceAuth } from "./FinanceAuthContext";
import type { WSEvent, Transaction, Balance } from "@/types/finance";

type EventHandler = (event: WSEvent) => void;

interface FinanceWSContextType {
  connected: boolean;
  on: (handler: EventHandler) => () => void;
}

const FinanceWSContext = createContext<FinanceWSContextType>({
  connected: false,
  on: () => () => {},
});

export function FinanceWSProvider({ children }: { children: React.ReactNode }) {
  const { activeBusiness, token } = useFinanceAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<EventHandler>>(new Set());
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (!activeBusiness?.id || !token) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = createFinanceWS(activeBusiness.id, token);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as WSEvent;
          handlersRef.current.forEach((h) => h(event));
        } catch {}
      };
    } catch {}
  }, [activeBusiness?.id, token]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const on = useCallback((handler: EventHandler) => {
    handlersRef.current.add(handler);
    return () => { handlersRef.current.delete(handler); };
  }, []);

  return (
    <FinanceWSContext.Provider value={{ connected, on }}>
      {children}
    </FinanceWSContext.Provider>
  );
}

export function useFinanceWS() {
  return useContext(FinanceWSContext);
}
