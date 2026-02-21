import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Business, Membership } from "@/types/finance";

const BUSINESS_KEY = "finance_business_id";

interface FinanceAuthContextType {
  user: User | null;
  profile: { full_name: string; email: string } | null;
  businesses: (Business & { role: string })[];
  activeBusiness: (Business & { role: string }) | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  selectBusiness: (b: Business & { role: string }) => void;
  refreshBusinesses: () => Promise<void>;
}

const FinanceAuthContext = createContext<FinanceAuthContextType | undefined>(undefined);

export function FinanceAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<(Business & { role: string })[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<(Business & { role: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBusinesses = useCallback(async () => {
    const { data: memberships } = await supabase
      .from("memberships")
      .select("*, businesses(*)");
    
    if (memberships && memberships.length > 0) {
      const bizList = memberships.map((m: any) => ({
        ...m.businesses,
        role: m.role,
      }));
      setBusinesses(bizList);

      const savedId = localStorage.getItem(BUSINESS_KEY);
      const found = bizList.find((b: any) => b.id === savedId);
      if (found) setActiveBusiness(found);
      else {
        setActiveBusiness(bizList[0]);
        localStorage.setItem(BUSINESS_KEY, bizList[0].id);
      }
    } else {
      setBusinesses([]);
      setActiveBusiness(null);
    }
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    // Set up auth listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setToken(session.access_token);
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => {
          loadProfile(session.user.id);
          refreshBusinesses();
        }, 0);
      } else {
        setUser(null);
        setToken(null);
        setProfile(null);
        setBusinesses([]);
        setActiveBusiness(null);
      }
      setLoading(false);
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setToken(session.access_token);
        loadProfile(session.user.id);
        refreshBusinesses();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile, refreshBusinesses]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoading(false); throw new Error(error.message); }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(BUSINESS_KEY);
  };

  const selectBusiness = (b: Business & { role: string }) => {
    setActiveBusiness(b);
    localStorage.setItem(BUSINESS_KEY, b.id);
  };

  return (
    <FinanceAuthContext.Provider value={{
      user, profile, businesses, activeBusiness, token, loading,
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
