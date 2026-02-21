
-- =============================================
-- FINANCE MODULE - Complete Schema (skip profiles, already exists)
-- =============================================

-- Add "Users can view all profiles" policy if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles') THEN
    CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
  END IF;
END $$;

-- Drop the restrictive select policy to allow viewing other members
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'COP',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- 3. Memberships
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.is_business_member(biz_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid() AND business_id = biz_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- RLS businesses
CREATE POLICY "Members can view their businesses" ON public.businesses FOR SELECT USING (public.is_business_member(id));
CREATE POLICY "Authenticated users can create businesses" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners can update business" ON public.businesses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.memberships WHERE user_id = auth.uid() AND business_id = id AND role = 'OWNER')
);

-- RLS memberships
CREATE POLICY "Members can view memberships" ON public.memberships FOR SELECT USING (public.is_business_member(business_id));
CREATE POLICY "Can insert memberships" ON public.memberships FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.memberships m2 WHERE m2.user_id = auth.uid() AND m2.business_id = memberships.business_id AND m2.role IN ('OWNER', 'ADMIN'))
  OR auth.uid() = user_id
);

-- 4. Funds
CREATE TABLE IF NOT EXISTS public.funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fund_type TEXT NOT NULL DEFAULT 'CASH' CHECK (fund_type IN ('CASH', 'BANK', 'WALLET')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view funds" ON public.funds FOR SELECT USING (public.is_business_member(business_id));
CREATE POLICY "Members can insert funds" ON public.funds FOR INSERT WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Members can update funds" ON public.funds FOR UPDATE USING (public.is_business_member(business_id));
CREATE POLICY "Members can delete funds" ON public.funds FOR DELETE USING (public.is_business_member(business_id));

-- 5. Cards
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  closing_day INT NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  credit_limit NUMERIC(15,2) NOT NULL DEFAULT 0,
  available_credit NUMERIC(15,2) NOT NULL DEFAULT 0,
  allow_overlimit BOOLEAN NOT NULL DEFAULT false,
  overlimit_limit NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view cards" ON public.cards FOR SELECT USING (public.is_business_member(business_id));
CREATE POLICY "Members can insert cards" ON public.cards FOR INSERT WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Members can update cards" ON public.cards FOR UPDATE USING (public.is_business_member(business_id));
CREATE POLICY "Members can delete cards" ON public.cards FOR DELETE USING (public.is_business_member(business_id));

-- 6. Finance Categories
CREATE TABLE IF NOT EXISTS public.finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT NOT NULL DEFAULT '#ef4444',
  parent_id UUID REFERENCES public.finance_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view categories" ON public.finance_categories FOR SELECT USING (public.is_business_member(business_id));
CREATE POLICY "Members can insert categories" ON public.finance_categories FOR INSERT WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Members can update categories" ON public.finance_categories FOR UPDATE USING (public.is_business_member(business_id));
CREATE POLICY "Members can delete categories" ON public.finance_categories FOR DELETE USING (public.is_business_member(business_id));

-- 7. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  tx_type TEXT NOT NULL CHECK (tx_type IN ('EXPENSE', 'INCOME', 'TRANSFER', 'CARD_CHARGE', 'CARD_PAYMENT')),
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  category_id UUID REFERENCES public.finance_categories(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  tx_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view transactions" ON public.transactions FOR SELECT USING (public.is_business_member(business_id));
CREATE POLICY "Members can insert transactions" ON public.transactions FOR INSERT WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Members can delete transactions" ON public.transactions FOR DELETE USING (public.is_business_member(business_id));

-- 8. Transaction Legs
CREATE TABLE IF NOT EXISTS public.transaction_legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('FUND', 'CARD')),
  entity_id UUID NOT NULL,
  signed_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transaction_legs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view legs" ON public.transaction_legs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND public.is_business_member(t.business_id))
);
CREATE POLICY "Members can insert legs" ON public.transaction_legs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND public.is_business_member(t.business_id))
);

-- 9. Balances
CREATE TABLE IF NOT EXISTS public.balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('FUND', 'CARD')),
  entity_id UUID NOT NULL,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, entity_type, entity_id)
);
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view balances" ON public.balances FOR SELECT USING (public.is_business_member(business_id));
CREATE POLICY "Members can upsert balances" ON public.balances FOR INSERT WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Members can update balances" ON public.balances FOR UPDATE USING (public.is_business_member(business_id));

-- 10. Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.finance_categories(id),
  monthly_limit NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view budgets" ON public.budgets FOR SELECT USING (public.is_business_member(business_id));
CREATE POLICY "Members can manage budgets" ON public.budgets FOR ALL USING (public.is_business_member(business_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_funds_updated_at BEFORE UPDATE ON public.funds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_finance_categories_updated_at BEFORE UPDATE ON public.finance_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
