import type { InvoiceData, InvoiceItem } from "@/types/invoice";

export function lineTotal(item: InvoiceItem): number {
  return item.quantity * item.unitPrice;
}

export function calcSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, i) => sum + lineTotal(i), 0);
}

export function calcTax(subtotal: number, rate?: number): number {
  return rate ? subtotal * rate : 0;
}

export function calcTotal(data: InvoiceData): {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
} {
  const subtotal = calcSubtotal(data.items);
  const tax = calcTax(subtotal, data.taxRate);
  const discount = data.discount ?? 0;
  return { subtotal, tax, discount, total: subtotal + tax - discount };
}

export function fmtCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
