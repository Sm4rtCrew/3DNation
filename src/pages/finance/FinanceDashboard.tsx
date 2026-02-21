import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFinanceAuth } from "@/context/FinanceAuthContext";
import type { Transaction, Balance } from "@/types/finance";
import { TrendingUp, TrendingDown, Wallet, CreditCard, ArrowLeftRight, RefreshCw, Building2, Plus } from "lucide-react";
import { formatCOP, formatDate, TX_TYPE_COLORS } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

function StatCard({ label, value, icon: Icon, positive, subtitle }: {
  label: string; value: number; icon: React.ElementType; positive?: boolean; subtitle?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.12)" }}>
          <Icon className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold font-mono-finance ${positive === undefined ? "" : positive ? "stat-positive" : "stat-negative"}`}>
          {formatCOP(value)}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function FinanceDashboard() {
  const { activeBusiness, user, refreshBusinesses } = useFinanceAuth();
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [fundsTotal, setFundsTotal] = useState(0);
  const [cardsDebt, setCardsDebt] = useState(0);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showCreateBiz, setShowCreateBiz] = useState(false);
  const [bizName, setBizName] = useState("");
  const [bizSaving, setBizSaving] = useState(false);

  const load = useCallback(async () => {
    if (!activeBusiness) { setLoading(false); return; }
    setLoading(true);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [incomeRes, expenseRes, balancesRes, txsRes] = await Promise.all([
      supabase.from("transactions").select("amount").eq("business_id", activeBusiness.id).eq("tx_type", "INCOME").gte("tx_date", startOfMonth),
      supabase.from("transactions").select("amount").eq("business_id", activeBusiness.id).eq("tx_type", "EXPENSE").gte("tx_date", startOfMonth),
      supabase.from("balances").select("*").eq("business_id", activeBusiness.id),
      supabase.from("transactions").select("*, finance_categories(*)").eq("business_id", activeBusiness.id).order("created_at", { ascending: false }).limit(10),
    ]);

    setIncome(incomeRes.data?.reduce((s, t) => s + Number(t.amount), 0) || 0);
    setExpense(expenseRes.data?.reduce((s, t) => s + Number(t.amount), 0) || 0);

    const balances = balancesRes.data || [];
    setFundsTotal(balances.filter(b => b.entity_type === "FUND").reduce((s, b) => s + Number(b.balance), 0));
    setCardsDebt(balances.filter(b => b.entity_type === "CARD").reduce((s, b) => s + Number(b.balance), 0));

    setRecentTxs((txsRes.data as any) || []);
    setLastUpdate(new Date());
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!activeBusiness) return;
    const channel = supabase
      .channel(`dashboard-${activeBusiness.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `business_id=eq.${activeBusiness.id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "balances", filter: `business_id=eq.${activeBusiness.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeBusiness, load]);

  const createBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !user) return;
    setBizSaving(true);

    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .insert({ name: bizName.trim(), created_by: user.id })
      .select()
      .single();

    if (biz) {
      await supabase.from("memberships").insert({ user_id: user.id, business_id: biz.id, role: "OWNER" });
      await refreshBusinesses();
      setShowCreateBiz(false);
      setBizName("");
    }
    setBizSaving(false);
  };

  const net = income - expense;

  if (!activeBusiness) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-20">
        <div className="glass-card rounded-2xl p-10 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold mb-2">Bienvenido a LedgerPro</h2>
          <p className="text-muted-foreground mb-6">Crea tu primer negocio para comenzar a registrar transacciones.</p>
          {!showCreateBiz ? (
            <Button onClick={() => setShowCreateBiz(true)}
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              <Plus className="w-4 h-4 mr-2" /> Crear Negocio
            </Button>
          ) : (
            <form onSubmit={createBusiness} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <Label>Nombre del Negocio</Label>
                <Input value={bizName} onChange={(e) => setBizName(e.target.value)}
                  placeholder="Mi Empresa S.A.S." required className="bg-muted border-border" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateBiz(false)}>Cancelar</Button>
                <Button type="submit" disabled={bizSaving}
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  {bizSaving ? "Creando..." : "Crear"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold neon-red-text">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-primary/40 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "hsl(var(--primary))" }} />
          Actualizar
        </button>
      </div>

      {loading && !recentTxs.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-28 animate-pulse bg-muted" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Ingresos del mes" value={income} icon={TrendingUp} positive={true} subtitle="COP" />
            <StatCard label="Gastos del mes" value={expense} icon={TrendingDown} positive={false} subtitle="COP" />
            <StatCard label="Total en Fondos" value={fundsTotal} icon={Wallet} subtitle="Saldo disponible" />
            <StatCard label="Deuda Tarjetas" value={cardsDebt} icon={CreditCard} positive={false} subtitle="Total utilizado" />
          </div>

          <div className="glass-card rounded-2xl p-5 neon-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Balance Neto</p>
                <p className={`text-4xl font-bold font-mono-finance ${net >= 0 ? "stat-positive" : "stat-negative"}`}>
                  {net >= 0 ? "+" : ""}{formatCOP(net)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Ingresos − Gastos</p>
                <p className="text-xs text-muted-foreground mt-1">Moneda: COP</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Transacciones Recientes</h2>
              <a href="/transactions" className="text-xs font-medium hover:underline" style={{ color: "hsl(var(--primary))" }}>Ver todas</a>
            </div>
            {recentTxs.length > 0 ? recentTxs.map((tx) => {
              const isIncome = tx.tx_type === "INCOME";
              const isExpense = tx.tx_type === "EXPENSE";
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors rounded-lg px-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isIncome ? "hsl(var(--success) / 0.15)" : isExpense ? "hsl(var(--destructive) / 0.15)" : "hsl(var(--muted))" }}>
                    {isIncome ? <TrendingUp className="w-4 h-4 text-success" /> : isExpense ? <TrendingDown className="w-4 h-4 text-destructive" /> : <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{(tx as any).finance_categories?.name || "—"} · {formatDate(tx.created_at)}</p>
                  </div>
                  <p className={`text-sm font-semibold font-mono-finance shrink-0`} style={{ color: TX_TYPE_COLORS[tx.tx_type] }}>
                    {isIncome ? "+" : "-"}{formatCOP(Number(tx.amount))}
                  </p>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground text-center py-6">Sin transacciones recientes</p>}
          </div>
        </>
      )}
    </div>
  );
}
