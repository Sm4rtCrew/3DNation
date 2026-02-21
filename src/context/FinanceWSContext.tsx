import React, { createContext, useContext, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFinanceAuth } from "./FinanceAuthContext";

interface FinanceWSContextType {
  connected: boolean;
}

const FinanceWSContext = createContext<FinanceWSContextType>({ connected: true });

export function FinanceWSProvider({ children }: { children: React.ReactNode }) {
  const { activeBusiness } = useFinanceAuth();

  // Supabase Realtime handles connectivity automatically
  // Individual components subscribe to specific table changes directly

  return (
    <FinanceWSContext.Provider value={{ connected: true }}>
      {children}
    </FinanceWSContext.Provider>
  );
}

export function useFinanceWS() {
  return useContext(FinanceWSContext);
}
