import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Invoice from "@/components/invoice/Invoice";
import type { InvoiceData, InvoiceItem } from "@/types/invoice";
import { calcTotal, fmtCurrency } from "@/lib/invoice-utils";
import { Plus, Trash2, Eye, Edit3, Printer, FileText } from "lucide-react";

const emptyItem: InvoiceItem = { description: "", quantity: 1, unitPrice: 0 };

const defaultData: InvoiceData = {
  invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  status: "draft",
  currency: "USD",
  taxRate: 0,
  discount: 0,
  company: { name: "", address: "", email: "", phone: "" },
  client: { name: "", address: "", email: "" },
  items: [{ ...emptyItem }],
  payment: { method: "Bank Transfer" },
};

export default function InvoiceCreate() {
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [view, setView] = useState<"form" | "preview">("form");

  const set = <K extends keyof InvoiceData>(k: K, v: InvoiceData[K]) =>
    setData((prev) => ({ ...prev, [k]: v }));

  const setCompany = (k: string, v: string) =>
    setData((prev) => ({ ...prev, company: { ...prev.company, [k]: v } }));

  const setClient = (k: string, v: string) =>
    setData((prev) => ({ ...prev, client: { ...prev.client, [k]: v } }));

  const setPayment = (k: string, v: string) =>
    setData((prev) => ({ ...prev, payment: { ...prev.payment, [k]: v } }));

  const setItem = (idx: number, k: keyof InvoiceItem, v: string | number) =>
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, [k]: v } : it)),
    }));

  const addItem = () => setData((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));

  const removeItem = (idx: number) =>
    setData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const totals = calcTotal(data);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Crear Factura</h1>
              <p className="text-xs text-muted-foreground">Completa los datos y previsualiza</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "form" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("form")}
            >
              <Edit3 className="h-4 w-4 mr-1" /> Editar
            </Button>
            <Button
              variant={view === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("preview")}
            >
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
            {view === "preview" && (
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Imprimir
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview mode */}
      {view === "preview" && (
        <div className="py-8 px-4 print:py-0 print:px-0" style={{ backgroundColor: "#f1f5f9" }}>
          <Invoice data={data} />
        </div>
      )}

      {/* Form mode */}
      {view === "form" && (
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
          {/* Row 1: Invoice meta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">N° Factura</Label>
              <Input value={data.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Fecha emisión</Label>
              <Input type="date" value={data.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Fecha vencimiento</Label>
              <Input type="date" value={data.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Estado</Label>
              <Select value={data.status ?? "draft"} onValueChange={(v) => set("status", v as InvoiceData["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="paid">Pagada</SelectItem>
                  <SelectItem value="overdue">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Company + Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tu Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nombre</Label>
                  <Input placeholder="Financial Core Inc." value={data.company.name} onChange={(e) => setCompany("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dirección</Label>
                  <Textarea rows={2} placeholder="Calle, Ciudad, País" value={data.company.address} onChange={(e) => setCompany("address", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input type="email" placeholder="billing@company.com" value={data.company.email} onChange={(e) => setCompany("email", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Teléfono</Label>
                    <Input placeholder="+1 555 000 0000" value={data.company.phone} onChange={(e) => setCompany("phone", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">NIT / Tax ID (opcional)</Label>
                  <Input placeholder="900.123.456-7" value={data.company.taxId ?? ""} onChange={(e) => setCompany("taxId", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nombre</Label>
                  <Input placeholder="Nombre del cliente" value={data.client.name} onChange={(e) => setClient("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Empresa (opcional)</Label>
                  <Input placeholder="Empresa del cliente" value={data.client.company ?? ""} onChange={(e) => setClient("company", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dirección</Label>
                  <Textarea rows={2} placeholder="Dirección del cliente" value={data.client.address} onChange={(e) => setClient("address", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input type="email" placeholder="cliente@email.com" value={data.client.email} onChange={(e) => setClient("email", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Items */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Servicios / Productos</CardTitle>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {/* Header */}
              <div className="hidden md:grid grid-cols-[1fr_80px_120px_120px_40px] gap-3 mb-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider px-1">
                <span>Descripción</span>
                <span className="text-center">Cant.</span>
                <span className="text-right">Precio Unit.</span>
                <span className="text-right">Subtotal</span>
                <span />
              </div>
              <div className="space-y-3">
                {data.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_120px_40px] gap-3 items-center bg-muted/30 rounded-lg p-3 md:p-2">
                    <Input
                      placeholder="Descripción del servicio"
                      value={item.description}
                      onChange={(e) => setItem(i, "description", e.target.value)}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="text-center"
                      value={item.quantity}
                      onChange={(e) => setItem(i, "quantity", Math.max(1, Number(e.target.value)))}
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="text-right"
                      value={item.unitPrice}
                      onChange={(e) => setItem(i, "unitPrice", Math.max(0, Number(e.target.value)))}
                    />
                    <div className="text-right font-medium text-sm text-foreground pr-1">
                      {fmtCurrency(item.quantity * item.unitPrice, data.currency)}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(i)}
                      disabled={data.items.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Row 4: Tax, Discount, Currency + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Impuestos y Descuentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Moneda</Label>
                    <Select value={data.currency ?? "USD"} onValueChange={(v) => set("currency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Impuesto (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={(data.taxRate ?? 0) * 100}
                      onChange={(e) => set("taxRate", Math.max(0, Number(e.target.value)) / 100)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Descuento</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.discount ?? 0}
                      onChange={(e) => set("discount", Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{fmtCurrency(totals.subtotal, data.currency)}</span>
                  </div>
                  {totals.tax > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Impuesto</span><span>{fmtCurrency(totals.tax, data.currency)}</span>
                    </div>
                  )}
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Descuento</span><span>-{fmtCurrency(totals.discount, data.currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Total</span><span>{fmtCurrency(totals.total, data.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Información de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Método de pago</Label>
                  <Input placeholder="Transferencia bancaria" value={data.payment.method} onChange={(e) => setPayment("method", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Banco</Label>
                    <Input placeholder="Nombre del banco" value={data.payment.bankName ?? ""} onChange={(e) => setPayment("bankName", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">N° Cuenta</Label>
                    <Input placeholder="****-4521" value={data.payment.accountNumber ?? ""} onChange={(e) => setPayment("accountNumber", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Notas</Label>
                  <Textarea rows={3} placeholder="Términos de pago, notas adicionales..." value={data.payment.notes ?? ""} onChange={(e) => setPayment("notes", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" size="lg" onClick={() => setView("preview")}>
              <Eye className="h-4 w-4 mr-2" /> Previsualizar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
