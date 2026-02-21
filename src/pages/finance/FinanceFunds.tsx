import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFinanceAuth } from "@/context/FinanceAuthContext";
import type { Fund, FundType, Balance } from "@/types/finance";
import { formatCOP } from "@/lib/formatters";
import { Wallet, Plus, X, Banknote, Building2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FUND_ICONS: Record<FundType, React.ElementType> = { CASH: Banknote, BANK: Building2, WALLET: Smartphone };
const FUND_COLORS: Record<FundType, string> = {
  CASH: "hsl(var(--success))", BANK: "hsl(var(--info))", WALLET: "hsl(var(--warning))",
};

interface FormState { name: string; fund_type: FundType; description: string; }
const defaultForm: FormState = { name: "", fund_type: "CASH", description: "" };

export default function FinanceFunds() {
  const { activeBusiness } = useFinanceAuth();
  const [funds, setFunds] = useState<(Fund & { balance: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    const [fundsRes, balancesRes] = await Promise.all([
      supabase.from("funds").select("*").eq("business_id", activeBusiness.id),
      supabase.from("balances").select("*").eq("business_id", activeBusiness.id).eq("entity_type", "FUND"),
    ]);
    const balMap = new Map((balancesRes.data || []).map(b => [b.entity_id, Number(b.balance)]));
    setFunds(((fundsRes.data as any) || []).map((f: Fund) => ({ ...f, balance: balMap.get(f.id) || 0 })));
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    if (!form.name.trim()) { setFormError("El nombre es requerido."); return; }
    if (!activeBusiness) return;
    setSaving(true);
    const { error } = await supabase.from("funds").insert({
      business_id: activeBusiness.id, name: form.name.trim(),
      fund_type: form.fund_type, description: form.description || null,
    });
    if (error) setFormError(error.message);
    else { setShowModal(false); setForm(defaultForm); load(); }
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold neon-red-text">Fondos</h1>
          <p className="text-sm text-muted-foreground">Cajas, cuentas bancarias y billeteras</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 neon-red"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" /> Nuevo Fondo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-36 animate-pulse bg-muted" />)}
        </div>
      ) : funds.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Sin fondos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {funds.map((fund) => {
            const Icon = FUND_ICONS[fund.fund_type];
            const color = FUND_COLORS[fund.fund_type];
            return (
              <div key={fund.id} className="glass-card rounded-2xl p-5 flex flex-col gap-4 fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="font-semibold">{fund.name}</p>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
                      {fund.fund_type}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Saldo</p>
                  <p className="text-2xl font-bold font-mono-finance" style={{ color }}>{formatCOP(fund.balance)}</p>
                  <p className="text-xs text-muted-foreground mt-1">COP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
          <div className="glass-card rounded-2xl w-full max-w-md slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold neon-red-text">Nuevo Fondo</h2>
              <button onClick={() => { setShowModal(false); setForm(defaultForm); setFormError(""); }}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input placeholder="Ej: Caja Principal, Bancolombia..." value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required className="bg-muted border-border" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Fondo *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "BANK", "WALLET"] as FundType[]).map((t) => {
                    const Icon = FUND_ICONS[t]; const color = FUND_COLORS[t];
                    return (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, fund_type: t }))}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all"
                        style={{
                          background: form.fund_type === t ? `${color}22` : "transparent",
                          borderColor: form.fund_type === t ? color : "hsl(var(--border))",
                          color: form.fund_type === t ? color : "hsl(var(--muted-foreground))",
                        }}>
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">{t === "CASH" ? "Efectivo" : t === "BANK" ? "Banco" : "Billetera"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Input placeholder="Opcional..." value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="bg-muted border-border" />
              </div>
              {formError && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setForm(defaultForm); }}>Cancelar</Button>
                <Button type="submit" disabled={saving}
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  {saving ? "Guardando..." : "Crear Fondo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
