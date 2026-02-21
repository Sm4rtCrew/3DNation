export interface Business {
  id: string;
  name: string;
  description?: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  business_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  created_at: string;
}

export type FundType = "CASH" | "BANK" | "WALLET";
export interface Fund {
  id: string;
  business_id: string;
  name: string;
  fund_type: FundType;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  business_id: string;
  name: string;
  credit_limit: number;
  available_credit: number;
  closing_day: number;
  due_day: number;
  allow_overlimit: boolean;
  overlimit_limit: number;
  created_at: string;
  updated_at: string;
}

export interface FinanceCategory {
  id: string;
  business_id: string;
  name: string;
  color: string;
  icon?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export type TxType = "EXPENSE" | "INCOME" | "TRANSFER" | "CARD_CHARGE" | "CARD_PAYMENT";

export interface Transaction {
  id: string;
  business_id: string;
  tx_type: TxType;
  amount: number;
  description: string;
  category_id?: string;
  created_by: string;
  tx_date: string;
  created_at: string;
  // joined
  finance_categories?: FinanceCategory;
}

export interface TransactionLeg {
  id: string;
  transaction_id: string;
  entity_type: "FUND" | "CARD";
  entity_id: string;
  signed_amount: number;
  created_at: string;
}

export interface Balance {
  id: string;
  business_id: string;
  entity_type: "FUND" | "CARD";
  entity_id: string;
  balance: number;
  updated_at: string;
}
