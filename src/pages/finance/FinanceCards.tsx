import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Card } from "@/types/finance";
import { formatCOP } from "@/lib/formatters";
import { CreditCard, Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinanceWS } from "@/context/FinanceWSContext";

interface FormState {
  name: string; last_four: string; credit_limit: string;
  closing_day: string; due_day: string; allow_overlimit: boolean; overlimit_limit: string;
}
const defaultForm: FormState = {
  name: "", last_four: "", credit_limit: "", closing_day: "25",
  due_day: "5", allow_overlimit: false, overlimit_limit: "0",
};

function CreditBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, ((limit - used) / limit) * 100) : 0;
  const color = pct > 40 ? "hsl(var(--success))" : pct > 20 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Disponible</span><span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function FinanceCards() {
  const { on } = useFinanceWS();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setCards(await api.get<Card[]>("/finance/cards")); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time credit updates
  useEffect(() => on((event) => {
    if (event.event === "card_credit_updated") {
      setCards((prev) => prev.map((c) =>
        c.id === event.data.card_id ? { ...c, available_credit: event.data.available_credit } : c
      ));
    }
  }), [on]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    const limit = Number(form.credit_limit);
    if (!form.name.trim()) { setFormError("El nombre es requerido."); return; }
    if (!limit || limit <= 0) { setFormError("El límite de crédito debe ser mayor a 0."); return; }
    setSaving(true);
    try {
      await api.post("/finance/cards", {
        name: form.name, last_four: form.last_four || undefined,
        credit_limit: limit, available_credit: limit,
        closing_day: Number(form.closing_day), due_day: Number(form.due_day),
        allow_overlimit: form.allow_overlimit,
        overlimit_limit: form.allow_overlimit ? Number(form.overlimit_limit) : 0,
        currency: "COP",
      });
      setShowModal(false); setForm(defaultForm); load();
    } catch (err: any) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold neon-red-text">Tarjetas de Crédito</h1>
          <p className="text-sm text-muted-foreground">Control de cupos y fechas de pago</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 neon-red"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" /> Nueva Tarjeta
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-48 animate-pulse bg-muted" />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Sin tarjetas registradas</p>
          <Button onClick={() => setShowModal(true)} className="mt-4"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            Agregar tarjeta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const used = card.credit_limit - card.available_credit;
            const isOverlimit = card.available_credit < 0;
            return (
              <div key={card.id} className={`glass-card rounded-2xl p-5 flex flex-col gap-4 fade-in neon-border`}>
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "hsl(var(--primary) / 0.15)" }}>
                      <CreditCard className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <div>
                      <p className="font-semibold">{card.name}</p>
                      {card.last_four && <p className="text-xs text-muted-foreground">•••• {card.last_four}</p>}
                    </div>
                  </div>
                  {isOverlimit && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Sobrecupo
                    </span>
                  )}
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Disponible</p>
                    <p className={`font-bold font-mono-finance text-lg ${isOverlimit ? "stat-negative" : "stat-positive"}`}>
                      {formatCOP(card.available_credit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Utilizado</p>
                    <p className="font-bold font-mono-finance text-lg text-foreground">{formatCOP(used)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Límite</p>
                    <p className="font-medium font-mono-finance">{formatCOP(card.credit_limit)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Cierre / Pago</p>
                    <p className="font-medium">Día {card.closing_day} / {card.due_day}</p>
                  </div>
                </div>

                <CreditBar used={used} limit={card.credit_limit} />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
          <div className="glass-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold neon-red-text">Nueva Tarjeta</h2>
              <button onClick={() => { setShowModal(false); setForm(defaultForm); setFormError(""); }}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input placeholder="Ej: Visa Bancolombia, Mastercard Davivienda..."
                  value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  required className="bg-muted border-border" />
              </div>
              <div className="space-y-1.5">
                <Label>Últimos 4 dígitos</Label>
                <Input placeholder="1234" maxLength={4} value={form.last_four}
                  onChange={(e) => setForm(f => ({ ...f, last_four: e.target.value.replace(/\D/g, "") }))}
                  className="bg-muted border-border" />
              </div>
              <div className="space-y-1.5">
                <Label>Límite de Crédito (COP) *</Label>
                <Input type="number" min="1000" step="1000" placeholder="5000000"
                  value={form.credit_limit} onChange={(e) => setForm(f => ({ ...f, credit_limit: e.target.value }))}
                  required className="bg-muted border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Día de Cierre *</Label>
                  <Input type="number" min="1" max="31" value={form.closing_day}
                    onChange={(e) => setForm(f => ({ ...f, closing_day: e.target.value }))}
                    required className="bg-muted border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Día de Pago *</Label>
                  <Input type="number" min="1" max="31" value={form.due_day}
                    onChange={(e) => setForm(f => ({ ...f, due_day: e.target.value }))}
                    required className="bg-muted border-border" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <input type="checkbox" id="overlimit" checked={form.allow_overlimit}
                  onChange={(e) => setForm(f => ({ ...f, allow_overlimit: e.target.checked }))}
                  className="rounded" />
                <label htmlFor="overlimit" className="text-sm cursor-pointer">Permitir sobrecupo</label>
              </div>
              {form.allow_overlimit && (
                <div className="space-y-1.5">
                  <Label>Límite de Sobrecupo (COP)</Label>
                  <Input type="number" min="0" step="1000" value={form.overlimit_limit}
                    onChange={(e) => setForm(f => ({ ...f, overlimit_limit: e.target.value }))}
                    className="bg-muted border-border" />
                </div>
              )}
              {formError && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setForm(defaultForm); }}>Cancelar</Button>
                <Button type="submit" disabled={saving}
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  {saving ? "Guardando..." : "Crear Tarjeta"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
