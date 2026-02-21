import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFinanceAuth } from "@/context/FinanceAuthContext";
import type { Transaction, Fund, Card, FinanceCategory, TxType } from "@/types/finance";
import { formatCOP, formatDate, TX_TYPE_LABELS, TX_TYPE_COLORS } from "@/lib/formatters";
import { Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TX_TYPES: TxType[] = ["EXPENSE", "INCOME", "TRANSFER", "CARD_CHARGE", "CARD_PAYMENT"];

function TxBadge({ type }: { type: TxType }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: `${TX_TYPE_COLORS[type]}22`, color: TX_TYPE_COLORS[type] }}>
      {TX_TYPE_LABELS[type]}
    </span>
  );
}

interface FormState {
  tx_type: TxType; amount: string; description: string;
  category_id: string; fund_id: string; card_id: string;
}

const defaultForm: FormState = {
  tx_type: "EXPENSE", amount: "", description: "",
  category_id: "", fund_id: "", card_id: "",
};

export default function FinanceTransactions() {
  const { activeBusiness, user } = useFinanceAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TxType | "">("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadTxs = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    let query = supabase
      .from("transactions")
      .select("*, finance_categories(*)")
      .eq("business_id", activeBusiness.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (filterType) query = query.eq("tx_type", filterType);
    if (search) query = query.ilike("description", `%${search}%`);

    const { data } = await query;
    setTxs((data as any) || []);
    setLoading(false);
  }, [activeBusiness, search, filterType]);

  const loadMeta = useCallback(async () => {
    if (!activeBusiness) return;
    const [f, c, ca] = await Promise.all([
      supabase.from("funds").select("*").eq("business_id", activeBusiness.id),
      supabase.from("cards").select("*").eq("business_id", activeBusiness.id),
      supabase.from("finance_categories").select("*").eq("business_id", activeBusiness.id),
    ]);
    setFunds((f.data as any) || []);
    setCards((c.data as any) || []);
    setCategories((ca.data as any) || []);
  }, [activeBusiness]);

  useEffect(() => { loadTxs(); }, [loadTxs]);
  useEffect(() => { loadMeta(); }, [loadMeta]);

  // Realtime
  useEffect(() => {
    if (!activeBusiness) return;
    const channel = supabase
      .channel(`txs-${activeBusiness.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions", filter: `business_id=eq.${activeBusiness.id}` }, () => loadTxs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeBusiness, loadTxs]);

  const needsCard = form.tx_type === "CARD_CHARGE" || form.tx_type === "CARD_PAYMENT";
  const needsFund = !needsCard || form.tx_type === "CARD_PAYMENT";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.amount || Number(form.amount) <= 0) { setFormError("Monto inválido."); return; }
    if (!form.description.trim()) { setFormError("La descripción es requerida."); return; }
    if (!user || !activeBusiness) return;

    setSaving(true);
    try {
      // Insert transaction
      const { data: tx, error: txErr } = await supabase.from("transactions").insert({
        business_id: activeBusiness.id,
        tx_type: form.tx_type,
        amount: Number(form.amount),
        description: form.description.trim(),
        category_id: form.category_id || null,
        created_by: user.id,
      }).select().single();

      if (txErr) throw new Error(txErr.message);

      // Create transaction legs and update balances
      if (tx) {
        if (needsFund && form.fund_id) {
          const signedAmount = form.tx_type === "INCOME" ? Number(form.amount) : -Number(form.amount);
          await supabase.from("transaction_legs").insert({
            transaction_id: tx.id, entity_type: "FUND", entity_id: form.fund_id, signed_amount: signedAmount,
          });
          // Upsert balance
          const { data: existing } = await supabase.from("balances")
            .select("*").eq("business_id", activeBusiness.id).eq("entity_type", "FUND").eq("entity_id", form.fund_id).single();
          if (existing) {
            await supabase.from("balances").update({ balance: Number(existing.balance) + signedAmount }).eq("id", existing.id);
          } else {
            await supabase.from("balances").insert({
              business_id: activeBusiness.id, entity_type: "FUND", entity_id: form.fund_id, balance: signedAmount,
            });
          }
        }
        if (needsCard && form.card_id) {
          const signedAmount = form.tx_type === "CARD_CHARGE" ? Number(form.amount) : -Number(form.amount);
          await supabase.from("transaction_legs").insert({
            transaction_id: tx.id, entity_type: "CARD", entity_id: form.card_id, signed_amount: signedAmount,
          });
          // Update card available_credit
          const { data: card } = await supabase.from("cards").select("available_credit").eq("id", form.card_id).single();
          if (card) {
            await supabase.from("cards").update({
              available_credit: Number(card.available_credit) - signedAmount,
            }).eq("id", form.card_id);
          }
          // Upsert card balance
          const { data: existing } = await supabase.from("balances")
            .select("*").eq("business_id", activeBusiness.id).eq("entity_type", "CARD").eq("entity_id", form.card_id).single();
          if (existing) {
            await supabase.from("balances").update({ balance: Number(existing.balance) + signedAmount }).eq("id", existing.id);
          } else {
            await supabase.from("balances").insert({
              business_id: activeBusiness.id, entity_type: "CARD", entity_id: form.card_id, balance: signedAmount,
            });
          }
        }
      }

      setShowModal(false);
      setForm(defaultForm);
      loadTxs();
    } catch (err: any) {
      setFormError(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold neon-red-text">Transacciones</h1>
          <p className="text-sm text-muted-foreground">{txs.length} registros</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 neon-red"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" /> Nueva Transacción
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar transacciones..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted border-border" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as TxType | "")}
          className="px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground">
          <option value="">Todos los tipos</option>
          {TX_TYPES.map((t) => <option key={t} value={t}>{TX_TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Tipo", "Descripción", "Categoría", "Fecha", "Monto"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-full" /></td></tr>
              )) : txs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Sin transacciones. ¡Crea la primera!</td></tr>
              ) : txs.map((tx) => (
                <tr key={tx.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><TxBadge type={tx.tx_type} /></td>
                  <td className="px-4 py-3 max-w-xs"><p className="truncate font-medium">{tx.description}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{(tx as any).finance_categories?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(tx.created_at)}</td>
                  <td className="px-4 py-3 font-semibold font-mono-finance whitespace-nowrap" style={{ color: TX_TYPE_COLORS[tx.tx_type] }}>
                    {tx.tx_type === "INCOME" ? "+" : "-"}{formatCOP(Number(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
          <div className="glass-card rounded-2xl w-full max-w-lg slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold neon-red-text">Nueva Transacción</h2>
              <button onClick={() => { setShowModal(false); setForm(defaultForm); setFormError(""); }}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TX_TYPES.map((t) => (
                  <button key={t} type="button"
                    onClick={() => setForm(f => ({ ...f, tx_type: t, card_id: "", fund_id: "" }))}
                    className="py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition-all text-center border"
                    style={{
                      background: form.tx_type === t ? `${TX_TYPE_COLORS[t]}22` : "transparent",
                      borderColor: form.tx_type === t ? TX_TYPE_COLORS[t] : "hsl(var(--border))",
                      color: form.tx_type === t ? TX_TYPE_COLORS[t] : "hsl(var(--muted-foreground))",
                    }}>
                    {TX_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Monto (COP) *</Label>
                  <Input type="number" min="1" step="100" placeholder="50000"
                    value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    required className="bg-muted border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <select value={form.category_id} onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground">
                    <option value="">Sin categoría</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {needsFund && (
                <div className="space-y-1.5">
                  <Label>Fondo</Label>
                  <select value={form.fund_id} onChange={(e) => setForm(f => ({ ...f, fund_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground">
                    <option value="">Seleccionar fondo</option>
                    {funds.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.fund_type})</option>)}
                  </select>
                </div>
              )}

              {needsCard && (
                <div className="space-y-1.5">
                  <Label>Tarjeta *</Label>
                  <select value={form.card_id} onChange={(e) => setForm(f => ({ ...f, card_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground" required>
                    <option value="">Seleccionar tarjeta</option>
                    {cards.map((c) => <option key={c.id} value={c.id}>{c.name} · {formatCOP(Number(c.available_credit))} disponible</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Descripción *</Label>
                <Input placeholder="Ej: Pago proveedor, Venta #123..."
                  value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  required className="bg-muted border-border" />
              </div>

              {formError && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setForm(defaultForm); }}>Cancelar</Button>
                <Button type="submit" disabled={saving}
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  {saving ? "Guardando..." : "Crear Transacción"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
