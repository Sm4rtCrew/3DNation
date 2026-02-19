import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useFinanceWS } from "@/context/FinanceWSContext";
import type { DashboardStats, Transaction, Balance } from "@/types/finance";
import { TrendingUp, TrendingDown, Wallet, CreditCard, ArrowLeftRight, RefreshCw } from "lucide-react";
import { formatCOP } from "@/lib/formatters";

function StatCard({
  label, value, icon: Icon, positive, subtitle,
}: {
  label: string; value: number; icon: React.ElementType; positive?: boolean; subtitle?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(var(--primary) / 0.12)" }}>
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

function TxRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === "INCOME";
  const isExpense = tx.type === "EXPENSE";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors rounded-lg px-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: isIncome ? "hsl(var(--success) / 0.15)" : isExpense ? "hsl(var(--destructive) / 0.15)" : "hsl(var(--muted))",
        }}>
        {isIncome ? <TrendingUp className="w-4 h-4 text-success" /> : isExpense ? <TrendingDown className="w-4 h-4 text-destructive" /> : <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description || tx.type}</p>
        <p className="text-xs text-muted-foreground">{tx.category?.name || "—"} · {new Date(tx.created_at).toLocaleDateString("es-CO")}</p>
      </div>
      <p className={`text-sm font-semibold font-mono-finance shrink-0 ${isIncome ? "stat-positive" : isExpense ? "stat-negative" : ""}`}>
        {isIncome ? "+" : isExpense ? "-" : ""}{formatCOP(tx.amount)}
      </p>
    </div>
  );
}

export default function FinanceDashboard() {
  const { on } = useFinanceWS();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<DashboardStats>("/finance/dashboard");
      setStats(data);
      setLastUpdate(new Date());
    } catch {
      /* API might not be running yet */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Listen for real-time updates
  useEffect(() => {
    return on((event) => {
      if (event.event === "tx_created" || event.event === "balance_updated") {
        load();
      }
    });
  }, [on, load]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold neon-red-text">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-primary/40 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "hsl(var(--primary))" }} />
          Actualizar
        </button>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-28 animate-pulse bg-muted" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Ingresos del mes" value={stats.total_income} icon={TrendingUp} positive={true} subtitle="COP" />
            <StatCard label="Gastos del mes" value={stats.total_expense} icon={TrendingDown} positive={false} subtitle="COP" />
            <StatCard label="Total en Fondos" value={stats.funds_total} icon={Wallet} subtitle="Saldo disponible" />
            <StatCard label="Deuda Tarjetas" value={stats.cards_debt} icon={CreditCard} positive={false} subtitle="Total utilizado" />
          </div>

          {/* Net balance banner */}
          <div className="glass-card rounded-2xl p-5 neon-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Balance Neto</p>
                <p className={`text-4xl font-bold font-mono-finance ${stats.net >= 0 ? "stat-positive" : "stat-negative"}`}>
                  {stats.net >= 0 ? "+" : ""}{formatCOP(stats.net)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Ingresos − Gastos</p>
                <p className="text-xs text-muted-foreground mt-1">Moneda: COP</p>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Transacciones Recientes
              </h2>
              <a href="/finance/transactions" className="text-xs font-medium hover:underline"
                style={{ color: "hsl(var(--primary))" }}>
                Ver todas
              </a>
            </div>
            {stats.recent_transactions?.length > 0
              ? stats.recent_transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)
              : <p className="text-sm text-muted-foreground text-center py-6">Sin transacciones recientes</p>}
          </div>
        </>
      ) : (
        <div className="glass-card rounded-2xl p-10 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No se pudo conectar con el servidor.</p>
          <p className="text-xs text-muted-foreground mt-1">Asegúrate de que FastAPI corre en http://127.0.0.1:8000</p>
          <button onClick={load} className="mt-4 text-sm font-medium underline" style={{ color: "hsl(var(--primary))" }}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
