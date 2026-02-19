import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types/finance";
import { Tag, Plus, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_COLORS = [
  "#ef4444","#f97316","#f59e0b","#84cc16","#22c55e",
  "#06b6d4","#3b82f6","#8b5cf6","#ec4899","#ffffff",
];

interface FormState { name: string; color: string; icon: string; parent_id: string; }
const defaultForm: FormState = { name: "", color: "#ef4444", icon: "", parent_id: "" };

export default function FinanceCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setCats(await api.get<Category[]>("/finance/categories")); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingCat(null); setForm(defaultForm); setFormError(""); setShowModal(true); };
  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, color: cat.color, icon: cat.icon || "", parent_id: cat.parent_id ? String(cat.parent_id) : "" });
    setFormError(""); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    if (!form.name.trim()) { setFormError("El nombre es requerido."); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), color: form.color,
        icon: form.icon || undefined,
        parent_id: form.parent_id ? Number(form.parent_id) : undefined,
      };
      if (editingCat) await api.put(`/finance/categories/${editingCat.id}`, payload);
      else await api.post("/finance/categories", payload);
      setShowModal(false); setForm(defaultForm); load();
    } catch (err: any) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`¿Eliminar categoría "${cat.name}"?`)) return;
    try { await api.delete(`/finance/categories/${cat.id}`); load(); } catch {}
  };

  const roots = cats.filter((c) => !c.parent_id);
  const children = cats.filter((c) => c.parent_id);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold neon-red-text">Categorías</h1>
          <p className="text-sm text-muted-foreground">Organiza tus transacciones por negocio</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 neon-red"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" /> Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-xl p-4 h-16 animate-pulse bg-muted" />)}
        </div>
      ) : cats.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Sin categorías registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {roots.map((root) => {
            const subs = children.filter((c) => c.parent_id === root.id);
            return (
              <div key={root.id} className="glass-card rounded-2xl overflow-hidden fade-in">
                {/* Root category */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${root.color}22` }}>
                    <span className="text-sm" style={{ color: root.color }}>
                      {root.icon || <Tag className="w-4 h-4" />}
                    </span>
                  </div>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: root.color }} />
                  <span className="font-semibold flex-1">{root.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(root)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(root)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {subs.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 px-5 py-3 border-b border-border/20 last:border-0 bg-muted/20">
                    <div className="w-4 border-l-2 border-border/50 h-4 ml-4 shrink-0" />
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sub.color }} />
                    <span className="text-sm flex-1 text-muted-foreground">{sub.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(sub)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(sub)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
          <div className="glass-card rounded-2xl w-full max-w-md slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold neon-red-text">{editingCat ? "Editar" : "Nueva"} Categoría</h2>
              <button onClick={() => { setShowModal(false); setEditingCat(null); setFormError(""); }}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input placeholder="Ej: Alimentación, Transporte, Ventas..."
                  value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  required className="bg-muted border-border" />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: c, border: form.color === c ? `2px solid white` : "2px solid transparent",
                        boxShadow: form.color === c ? `0 0 8px ${c}` : "none",
                      }} />
                  ))}
                  <input type="color" value={form.color}
                    onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-7 h-7 rounded-full cursor-pointer border border-border bg-muted" title="Color personalizado" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Emoji / Icono (opcional)</Label>
                <Input placeholder="🍔 💰 🚗 🏠 ..."
                  value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="bg-muted border-border" maxLength={4} />
              </div>
              <div className="space-y-1.5">
                <Label>Categoría Padre (opcional)</Label>
                <select value={form.parent_id} onChange={(e) => setForm(f => ({ ...f, parent_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground">
                  <option value="">Ninguna (categoría raíz)</option>
                  {roots.filter((r) => r.id !== editingCat?.id).map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              {formError && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingCat(null); }}>Cancelar</Button>
                <Button type="submit" disabled={saving}
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  {saving ? "Guardando..." : editingCat ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
