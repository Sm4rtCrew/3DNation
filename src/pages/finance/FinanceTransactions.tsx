import React, { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { useFinanceWS } from "@/context/FinanceWSContext";
import type { Transaction, Fund, Card, Category, TxType, PaginatedResponse } from "@/types/finance";
import { formatCOP, formatDate, TX_TYPE_LABELS, TX_TYPE_COLORS } from "@/lib/formatters";
import { Plus, X, TrendingUp, TrendingDown, ArrowLeftRight, CreditCard, Banknote, Search, Filter } from "lucide-react";
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
  type: TxType; amount: string; description: string;
  category_id: string; fund_id: string; card_id: string; reference: string;
}

const defaultForm: FormState = {
  type: "EXPENSE", amount: "", description: "",
  category_id: "", fund_id: "", card_id: "", reference: "",
};

export default function FinanceTransactions() {
  const { on } = useFinanceWS();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TxType | "">("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [newTxHighlight, setNewTxHighlight] = useState<number | null>(null);

  const PAGE_SIZE = 20;

  const loadTxs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), size: String(PAGE_SIZE) });
      if (search) params.set("search", search);
      if (filterType) params.set("type", filterType);
      const data = await api.get<PaginatedResponse<Transaction>>(`/finance/transactions?${params}`);
      setTxs(data.items);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  }, [search, filterType]);

  const loadMeta = useCallback(async () => {
    try {
      const [f, c, ca] = await Promise.all([
        api.get<Fund[]>("/finance/funds"),
        api.get<Card[]>("/finance/cards"),
        api.get<Category[]>("/finance/categories"),
      ]);
      setFunds(f); setCards(c); setCategories(ca);
    } catch {}
  }, []);

  useEffect(() => { loadTxs(page); }, [loadTxs, page]);
  useEffect(() => { loadMeta(); }, [loadMeta]);

  useEffect(() => on((event) => {
    if (event.event === "tx_created") {
      setTxs((prev) => [event.data, ...prev.slice(0, PAGE_SIZE - 1)]);
      setNewTxHighlight(event.data.id);
      setTimeout(() => setNewTxHighlight(null), 3000);
    }
  }), [on]);

  const needsCard = form.type === "CARD_CHARGE" || form.type === "CARD_PAYMENT";
  const needsFund = !needsCard || form.type === "CARD_PAYMENT";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError("Monto inválido."); return;
    }
    setSaving(true);
    try {
      await api.post("/finance/transactions", {
        type: form.type,
        amount: Number(form.amount),
        description: form.description || undefined,
        reference: form.reference || undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        fund_id: form.fund_id ? Number(form.fund_id) : undefined,
        card_id: form.card_id ? Number(form.card_id) : undefined,
      });
      setShowModal(false);
      setForm(defaultForm);
      loadTxs(1);
    } catch (err: any) {
      setFormError(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold neon-red-text">Transacciones</h1>
          <p className="text-sm text-muted-foreground">{total} registros</p>
        </div>
        <Button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 neon-red"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" /> Nueva Transacción
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar transacciones..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-muted border-border" />
        </div>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value as TxType | ""); setPage(1); }}
          className="px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground">
          <option value="">Todos los tipos</option>
          {TX_TYPES.map((t) => <option key={t} value={t}>{TX_TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Tipo", "Descripción", "Categoría", "Fondo/Tarjeta", "Fecha", "Monto"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                  </td></tr>
                ))
              ) : txs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                  Sin transacciones. ¡Crea la primera!
                </td></tr>
              ) : txs.map((tx) => (
                <tr key={tx.id}
                  className={`border-b border-border/20 hover:bg-muted/20 transition-colors ${newTxHighlight === tx.id ? "bg-primary/5 neon-border" : ""}`}>
                  <td className="px-4 py-3"><TxBadge type={tx.type} /></td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate font-medium">{tx.description || "—"}</p>
                    {tx.reference && <p className="text-xs text-muted-foreground truncate">Ref: {tx.reference}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tx.fund?.name || tx.card?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(tx.created_at)}</td>
                  <td className="px-4 py-3 font-semibold font-mono-finance whitespace-nowrap"
                    style={{ color: TX_TYPE_COLORS[tx.type] }}>
                    {tx.type === "INCOME" ? "+" : "-"}{formatCOP(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">Página {page} de {Math.ceil(total / PAGE_SIZE)}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Anterior</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}>Siguiente</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
          <div className="glass-card rounded-2xl w-full max-w-lg slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold neon-red-text">Nueva Transacción</h2>
              <button onClick={() => { setShowModal(false); setForm(defaultForm); setFormError(""); }}
                className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Type */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TX_TYPES.map((t) => (
                  <button key={t} type="button"
                    onClick={() => setForm(f => ({ ...f, type: t, card_id: "", fund_id: "" }))}
                    className="py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition-all text-center border"
                    style={{
                      background: form.type === t ? `${TX_TYPE_COLORS[t]}22` : "transparent",
                      borderColor: form.type === t ? TX_TYPE_COLORS[t] : "hsl(var(--border))",
                      color: form.type === t ? TX_TYPE_COLORS[t] : "hsl(var(--muted-foreground))",
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
                  <Label>Fondo *</Label>
                  <select value={form.fund_id} onChange={(e) => setForm(f => ({ ...f, fund_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground" required={needsFund && !needsCard}>
                    <option value="">Seleccionar fondo</option>
                    {funds.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.fund_type})</option>)}
                  </select>
                </div>
              )}

              {needsCard && (
                <div className="space-y-1.5">
                  <Label>Tarjeta *</Label>
                  <select value={form.card_id} onChange={(e) => setForm(f => ({ ...f, card_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground" required={needsCard}>
                    <option value="">Seleccionar tarjeta</option>
                    {cards.map((c) => <option key={c.id} value={c.id}>{c.name} · {formatCOP(c.available_credit)} disponible</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Input placeholder="Ej: Pago proveedor, Venta #123..."
                  value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="bg-muted border-border" />
              </div>
              <div className="space-y-1.5">
                <Label>Referencia</Label>
                <Input placeholder="Número de factura, recibo..."
                  value={form.reference} onChange={(e) => setForm(f => ({ ...f, reference: e.target.value }))}
                  className="bg-muted border-border" />
              </div>

              {formError && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setForm(defaultForm); }}>
                  Cancelar
                </Button>
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
