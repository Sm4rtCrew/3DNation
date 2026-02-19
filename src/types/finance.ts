export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface Business {
  id: number;
  name: string;
  created_at: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}

export type FundType = "CASH" | "BANK" | "WALLET";
export interface Fund {
  id: number;
  business_id: number;
  name: string;
  fund_type: FundType;
  scope: "BUSINESS" | "USER";
  currency: string;
  is_active: boolean;
  balance?: number;
  created_at: string;
}

export interface Card {
  id: number;
  business_id: number;
  name: string;
  last_four?: string;
  credit_limit: number;
  available_credit: number;
  closing_day: number;
  due_day: number;
  allow_overlimit: boolean;
  overlimit_limit: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  business_id: number;
  name: string;
  color: string;
  icon?: string;
  parent_id?: number;
  created_at: string;
}

export type TxType = "EXPENSE" | "INCOME" | "TRANSFER" | "CARD_CHARGE" | "CARD_PAYMENT";

export interface Transaction {
  id: number;
  business_id: number;
  type: TxType;
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
  category_id?: number;
  category?: Category;
  fund_id?: number;
  fund?: Fund;
  card_id?: number;
  card?: Card;
  created_by: number;
  created_at: string;
  legs?: TransactionLeg[];
}

export interface TransactionLeg {
  id: number;
  transaction_id: number;
  entity_type: "FUND" | "CARD";
  entity_id: number;
  signed_amount: number;
  currency: string;
}

export interface Balance {
  entity_type: "FUND" | "CARD";
  entity_id: number;
  balance: number;
  currency: string;
  updated_at: string;
}

export interface DashboardStats {
  total_income: number;
  total_expense: number;
  net: number;
  funds_total: number;
  cards_debt: number;
  recent_transactions: Transaction[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Real-time WS events
export type WSEvent =
  | { event: "tx_created"; data: Transaction }
  | { event: "balance_updated"; data: Balance }
  | { event: "card_credit_updated"; data: { card_id: number; available_credit: number } }
  | { event: "ping" };
