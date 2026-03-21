export interface InvoiceCompany {
  name: string;
  logo?: string;
  address: string;
  email: string;
  phone: string;
  taxId?: string;
}

export interface InvoiceClient {
  name: string;
  company?: string;
  address: string;
  email: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoicePaymentInfo {
  method: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  notes?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  company: InvoiceCompany;
  client: InvoiceClient;
  items: InvoiceItem[];
  taxRate?: number;       // e.g. 0.19 for 19%
  discount?: number;      // flat amount
  currency?: string;      // default USD
  payment: InvoicePaymentInfo;
  status?: "draft" | "sent" | "paid" | "overdue";
}
