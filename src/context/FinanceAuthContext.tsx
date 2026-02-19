import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, TOKEN_KEY, BUSINESS_KEY, USER_KEY, setToken, setBusinessId, clearAuth } from "@/lib/api";
import type { AuthUser, Business, LoginResponse } from "@/types/finance";

interface FinanceAuthContextType {
  user: AuthUser | null;
  businesses: Business[];
  activeBusiness: Business | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  selectBusiness: (b: Business) => void;
  refreshBusinesses: () => Promise<void>;
}

const FinanceAuthContext = createContext<FinanceAuthContextType | undefined>(undefined);

export function FinanceAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  });
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(() => {
    const id = localStorage.getItem(BUSINESS_KEY);
    return id ? { id: Number(id) } as Business : null;
  });
  const [loading, setLoading] = useState(false);

  const refreshBusinesses = useCallback(async () => {
    try {
      const data = await api.get<Business[]>("/businesses/me");
      setBusinesses(data);
      // If no active business set, pick first
      if (!localStorage.getItem(BUSINESS_KEY) && data.length > 0) {
        setActiveBusiness(data[0]);
        setBusinessId(data[0].id);
      } else if (data.length > 0) {
        const currentId = localStorage.getItem(BUSINESS_KEY);
        const found = data.find((b) => String(b.id) === currentId);
        if (found) setActiveBusiness(found);
        else { setActiveBusiness(data[0]); setBusinessId(data[0].id); }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      refreshBusinesses();
    }
  }, [token, user, refreshBusinesses]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", { email, password });
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      await refreshBusinesses();
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, full_name: fullName });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setTokenState(null);
    setBusinesses([]);
    setActiveBusiness(null);
  };

  const selectBusiness = (b: Business) => {
    setActiveBusiness(b);
    setBusinessId(b.id);
  };

  return (
    <FinanceAuthContext.Provider value={{
      user, businesses, activeBusiness, token, loading,
      login, register, logout, selectBusiness, refreshBusinesses,
    }}>
      {children}
    </FinanceAuthContext.Provider>
  );
}

export function useFinanceAuth() {
  const ctx = useContext(FinanceAuthContext);
  if (!ctx) throw new Error("useFinanceAuth must be used within FinanceAuthProvider");
  return ctx;
}
