import type { InvoiceData } from "@/types/invoice";
import { calcTotal, fmtCurrency, fmtDate, lineTotal } from "@/lib/invoice-utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface Props {
  data: InvoiceData;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-red-50 text-red-700",
};

export default function Invoice({ data }: Props) {
  const cur = data.currency ?? "USD";
  const { subtotal, tax, discount, total } = calcTotal(data);
  const status = data.status ?? "draft";

  return (
    <div className="mx-auto max-w-[820px] bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-0">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 p-8 pb-6">
        {/* Company */}
        <div className="flex items-start gap-3">
          {data.company.logo ? (
            <img src={data.company.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <FileText className="h-5 w-5" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{data.company.name}</h2>
            <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed mt-0.5">
              {data.company.address}
            </p>
            <p className="text-xs text-slate-500">{data.company.email}</p>
            <p className="text-xs text-slate-500">{data.company.phone}</p>
          </div>
        </div>

        {/* Invoice meta */}
        <div className="text-left sm:text-right space-y-1">
          <div className="flex items-center gap-2 sm:justify-end">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">INVOICE</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[status]}`}>
              {status}
            </span>
          </div>
          <p className="text-sm font-mono text-slate-500">{data.invoiceNumber}</p>
          <div className="mt-3 space-y-0.5 text-xs text-slate-500">
            <p><span className="font-medium text-slate-600">Issued:</span> {fmtDate(data.issueDate)}</p>
            <p><span className="font-medium text-slate-600">Due:</span> {fmtDate(data.dueDate)}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Bill To ── */}
      <div className="px-8 py-6">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-2">Bill To</p>
        <p className="text-sm font-semibold text-slate-900">{data.client.name}</p>
        {data.client.company && <p className="text-xs text-slate-500">{data.client.company}</p>}
        <p className="text-xs text-slate-500 whitespace-pre-line">{data.client.address}</p>
        <p className="text-xs text-slate-500">{data.client.email}</p>
      </div>

      {/* ── Items Table ── */}
      <div className="px-8">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-center px-4 py-3 w-20">Qty</th>
                <th className="text-right px-4 py-3 w-28">Unit Price</th>
                <th className="text-right px-4 py-3 w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 text-slate-700">{item.description}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtCurrency(item.unitPrice, cur)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">{fmtCurrency(lineTotal(item), cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="flex justify-end px-8 py-6">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{fmtCurrency(subtotal, cur)}</span>
          </div>
          {data.taxRate != null && data.taxRate > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Tax ({(data.taxRate * 100).toFixed(0)}%)</span>
              <span>{fmtCurrency(tax, cur)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{fmtCurrency(discount, cur)}</span>
            </div>
          )}
          <Separator className="bg-slate-200" />
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{fmtCurrency(total, cur)}</span>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Payment Info ── */}
      <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-2">Payment Details</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p><span className="font-medium text-slate-700">Method:</span> {data.payment.method}</p>
            {data.payment.bankName && <p><span className="font-medium text-slate-700">Bank:</span> {data.payment.bankName}</p>}
            {data.payment.accountNumber && <p><span className="font-medium text-slate-700">Account:</span> {data.payment.accountNumber}</p>}
            {data.payment.routingNumber && <p><span className="font-medium text-slate-700">Routing:</span> {data.payment.routingNumber}</p>}
          </div>
        </div>
        {data.payment.notes && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-2">Notes</p>
            <p className="text-xs text-slate-500 leading-relaxed">{data.payment.notes}</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="bg-slate-50 rounded-b-xl px-8 py-4 text-center">
        <p className="text-[11px] text-slate-400">Thank you for your business.</p>
      </div>
    </div>
  );
}
