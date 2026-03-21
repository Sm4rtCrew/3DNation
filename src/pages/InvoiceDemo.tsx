import Invoice from "@/components/invoice/Invoice";
import type { InvoiceData } from "@/types/invoice";

const sampleInvoice: InvoiceData = {
  invoiceNumber: "INV-2026-0042",
  issueDate: "2026-03-21",
  dueDate: "2026-04-20",
  status: "sent",
  currency: "USD",
  taxRate: 0.1,
  discount: 50,
  company: {
    name: "Financial Core Inc.",
    address: "350 Fifth Avenue, Suite 4200\nNew York, NY 10118",
    email: "billing@financialcore.io",
    phone: "+1 (555) 234-5678",
    taxId: "US-98-7654321",
  },
  client: {
    name: "Jane Cooper",
    company: "Acme Studios LLC",
    address: "1600 Amphitheatre Parkway\nMountain View, CA 94043",
    email: "jane@acmestudios.com",
  },
  items: [
    { description: "Platform Setup & Configuration", quantity: 1, unitPrice: 2500 },
    { description: "Monthly SaaS Subscription (Pro Plan)", quantity: 3, unitPrice: 199 },
    { description: "Custom Dashboard Development", quantity: 12, unitPrice: 150 },
    { description: "Data Migration & Integration", quantity: 1, unitPrice: 800 },
    { description: "Priority Support (per month)", quantity: 3, unitPrice: 99 },
  ],
  payment: {
    method: "Bank Transfer (ACH)",
    bankName: "Chase Bank",
    accountNumber: "****-****-4521",
    routingNumber: "021000021",
    notes: "Payment is due within 30 days. A late fee of 1.5% per month will apply to overdue balances. Please reference the invoice number on your payment.",
  },
};

export default function InvoiceDemo() {
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:py-0">
      {/* Print button */}
      <div className="mx-auto max-w-[820px] mb-4 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Print / Save PDF
        </button>
      </div>
      <Invoice data={sampleInvoice} />
    </div>
  );
}
