/** Format number as Colombian Peso (COP) */
export function formatCOP(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "$ 0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export const TX_TYPE_LABELS: Record<string, string> = {
  EXPENSE: "Gasto",
  INCOME: "Ingreso",
  TRANSFER: "Transferencia",
  CARD_CHARGE: "Cargo Tarjeta",
  CARD_PAYMENT: "Pago Tarjeta",
};

export const TX_TYPE_COLORS: Record<string, string> = {
  EXPENSE: "hsl(var(--destructive))",
  INCOME: "hsl(var(--success))",
  TRANSFER: "hsl(var(--info))",
  CARD_CHARGE: "hsl(var(--warning))",
  CARD_PAYMENT: "hsl(var(--primary))",
};
