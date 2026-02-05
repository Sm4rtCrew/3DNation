-- =====================================================
-- CALENDARIO INTERACTIVO - ESQUEMA COMPLETO
-- =====================================================

-- 1. TIPOS ENUM
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.permission_level AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.attendee_status AS ENUM ('pending', 'accepted', 'declined', 'maybe');
CREATE TYPE public.reminder_method AS ENUM ('notification', 'email', 'both');
CREATE TYPE public.recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- 2. TABLA PROFILES (datos de usuario)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLA TEAMS (equipos)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLA TEAM_MEMBERSHIPS (membresías de equipo)
CREATE TABLE public.team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- 5. TABLA CALENDARS (calendarios)
CREATE TABLE public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#10b981',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABLA CALENDAR_PERMISSIONS (permisos de calendario)
CREATE TABLE public.calendar_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_level permission_level NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(calendar_id, user_id)
);

-- 7. TABLA CATEGORIES (categorías con colores)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  icon TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TABLA RECURRENCE_RULES (reglas de recurrencia)
CREATE TABLE public.recurrence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency recurrence_frequency NOT NULL,
  interval_value INTEGER NOT NULL DEFAULT 1,
  by_weekday INTEGER[],
  by_monthday INTEGER[],
  until_date TIMESTAMPTZ,
  count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABLA EVENTS (eventos/hitos)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  activity TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule_id UUID REFERENCES public.recurrence_rules(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  color TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TABLA EVENT_ATTENDEES (integrantes del evento)
CREATE TABLE public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status attendee_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 11. TABLA EVENT_CHECKLISTS (listas de pendientes)
CREATE TABLE public.event_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. TABLA EVENT_SHOPPING_LISTS (listas de compras con precios)
CREATE TABLE public.event_shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit TEXT,
  price DECIMAL(10,2),
  is_purchased BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. TABLA EVENT_ATTACHMENTS (archivos adjuntos)
CREATE TABLE public.event_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. TABLA REMINDERS (recordatorios)
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_time TIMESTAMPTZ NOT NULL,
  method reminder_method NOT NULL DEFAULT 'notification',
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id, reminder_time)
);

-- =====================================================
-- FUNCIONES HELPER PARA RLS
-- =====================================================

-- Verificar si usuario es miembro de un equipo
CREATE OR REPLACE FUNCTION public.is_team_member(check_user_id UUID, check_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE user_id = check_user_id 
    AND team_id = check_team_id 
    AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = check_team_id AND owner_id = check_user_id
  );
$$;

-- Verificar si usuario es admin de un equipo
CREATE OR REPLACE FUNCTION public.is_team_admin(check_user_id UUID, check_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE user_id = check_user_id 
    AND team_id = check_team_id 
    AND role IN ('owner', 'admin')
    AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = check_team_id AND owner_id = check_user_id
  );
$$;

-- Verificar acceso a calendario
CREATE OR REPLACE FUNCTION public.can_access_calendar(check_user_id UUID, check_calendar_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Es el dueño del calendario
    SELECT 1 FROM public.calendars WHERE id = check_calendar_id AND owner_id = check_user_id
  ) OR EXISTS (
    -- Tiene permiso directo
    SELECT 1 FROM public.calendar_permissions WHERE calendar_id = check_calendar_id AND user_id = check_user_id
  ) OR EXISTS (
    -- Es miembro del equipo del calendario
    SELECT 1 FROM public.calendars c
    WHERE c.id = check_calendar_id 
    AND c.team_id IS NOT NULL 
    AND public.is_team_member(check_user_id, c.team_id)
  );
$$;

-- Verificar si puede editar evento
CREATE OR REPLACE FUNCTION public.can_edit_event(check_user_id UUID, check_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Es el creador del evento
    SELECT 1 FROM public.events WHERE id = check_event_id AND created_by = check_user_id
  ) OR EXISTS (
    -- Tiene permiso de edición en el calendario
    SELECT 1 FROM public.events e
    JOIN public.calendar_permissions cp ON e.calendar_id = cp.calendar_id
    WHERE e.id = check_event_id AND cp.user_id = check_user_id AND cp.permission_level IN ('owner', 'admin', 'editor')
  ) OR EXISTS (
    -- Es admin del equipo del calendario
    SELECT 1 FROM public.events e
    JOIN public.calendars c ON e.calendar_id = c.id
    WHERE e.id = check_event_id AND c.team_id IS NOT NULL AND public.is_team_admin(check_user_id, c.team_id)
  );
$$;

-- Verificar si es dueño o admin del evento
CREATE OR REPLACE FUNCTION public.is_event_owner_or_admin(check_user_id UUID, check_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events WHERE id = check_event_id AND created_by = check_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.calendars c ON e.calendar_id = c.id
    WHERE e.id = check_event_id AND c.owner_id = check_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.calendars c ON e.calendar_id = c.id
    WHERE e.id = check_event_id AND c.team_id IS NOT NULL AND public.is_team_admin(check_user_id, c.team_id)
  );
$$;

-- Verificar si es dueño o admin del calendario
CREATE OR REPLACE FUNCTION public.is_calendar_owner_or_admin(check_user_id UUID, check_calendar_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.calendars WHERE id = check_calendar_id AND owner_id = check_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.calendar_permissions 
    WHERE calendar_id = check_calendar_id AND user_id = check_user_id AND permission_level IN ('owner', 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.calendars c
    WHERE c.id = check_calendar_id AND c.team_id IS NOT NULL AND public.is_team_admin(check_user_id, c.team_id)
  );
$$;

-- =====================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurrence_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- TEAMS
CREATE POLICY "Members can view teams" ON public.teams FOR SELECT USING (public.is_team_member(auth.uid(), id));
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
CREATE POLICY "Admins can update teams" ON public.teams FOR UPDATE USING (public.is_team_admin(auth.uid(), id));
CREATE POLICY "Owners can delete teams" ON public.teams FOR DELETE USING (owner_id = auth.uid());

-- TEAM_MEMBERSHIPS
CREATE POLICY "Members can view memberships" ON public.team_memberships FOR SELECT USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Admins can insert memberships" ON public.team_memberships FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND user_id != auth.uid() AND public.is_team_admin(auth.uid(), team_id)
);
CREATE POLICY "Admins can update memberships" ON public.team_memberships FOR UPDATE USING (public.is_team_admin(auth.uid(), team_id));
CREATE POLICY "Admins can delete memberships" ON public.team_memberships FOR DELETE USING (public.is_team_admin(auth.uid(), team_id) OR user_id = auth.uid());

-- CALENDARS
CREATE POLICY "Users can view accessible calendars" ON public.calendars FOR SELECT USING (public.can_access_calendar(auth.uid(), id));
CREATE POLICY "Users can create calendars" ON public.calendars FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND owner_id = auth.uid() AND (team_id IS NULL OR public.is_team_member(auth.uid(), team_id))
);
CREATE POLICY "Owners/Admins can update calendars" ON public.calendars FOR UPDATE USING (public.is_calendar_owner_or_admin(auth.uid(), id));
CREATE POLICY "Owners/Admins can delete calendars" ON public.calendars FOR DELETE USING (public.is_calendar_owner_or_admin(auth.uid(), id));

-- CALENDAR_PERMISSIONS
CREATE POLICY "Users can view calendar permissions" ON public.calendar_permissions FOR SELECT USING (public.can_access_calendar(auth.uid(), calendar_id));
CREATE POLICY "Owners/Admins can insert permissions" ON public.calendar_permissions FOR INSERT WITH CHECK (public.is_calendar_owner_or_admin(auth.uid(), calendar_id));
CREATE POLICY "Owners/Admins can update permissions" ON public.calendar_permissions FOR UPDATE USING (public.is_calendar_owner_or_admin(auth.uid(), calendar_id));
CREATE POLICY "Owners/Admins can delete permissions" ON public.calendar_permissions FOR DELETE USING (public.is_calendar_owner_or_admin(auth.uid(), calendar_id));

-- CATEGORIES
CREATE POLICY "Users can view categories" ON public.categories FOR SELECT USING (
  user_id = auth.uid() OR (team_id IS NOT NULL AND public.is_team_member(auth.uid(), team_id))
);
CREATE POLICY "Users can create categories" ON public.categories FOR INSERT WITH CHECK (
  (team_id IS NULL AND user_id = auth.uid()) OR (team_id IS NOT NULL AND public.is_team_member(auth.uid(), team_id))
);
CREATE POLICY "Users can update categories" ON public.categories FOR UPDATE USING (user_id = auth.uid() OR (team_id IS NOT NULL AND public.is_team_admin(auth.uid(), team_id)));
CREATE POLICY "Users can delete categories" ON public.categories FOR DELETE USING (user_id = auth.uid() OR (team_id IS NOT NULL AND public.is_team_admin(auth.uid(), team_id)));

-- RECURRENCE_RULES
CREATE POLICY "Users can view recurrence rules" ON public.recurrence_rules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.recurrence_rule_id = id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can create recurrence rules" ON public.recurrence_rules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete recurrence rules" ON public.recurrence_rules FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.recurrence_rule_id = id AND public.is_event_owner_or_admin(auth.uid(), e.id))
);

-- EVENTS
CREATE POLICY "Users can view events" ON public.events FOR SELECT USING (public.can_access_calendar(auth.uid(), calendar_id));
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (public.can_access_calendar(auth.uid(), calendar_id) AND created_by = auth.uid());
CREATE POLICY "Users can update events" ON public.events FOR UPDATE USING (public.can_edit_event(auth.uid(), id));
CREATE POLICY "Owners/Admins can delete events" ON public.events FOR DELETE USING (public.is_event_owner_or_admin(auth.uid(), id));

-- EVENT_ATTENDEES
CREATE POLICY "Users can view attendees" ON public.event_attendees FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can add attendees" ON public.event_attendees FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Attendees can update their status" ON public.event_attendees FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Owners can delete attendees" ON public.event_attendees FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_event_owner_or_admin(auth.uid(), e.id))
);

-- EVENT_CHECKLISTS
CREATE POLICY "Users can view checklists" ON public.event_checklists FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can create checklists" ON public.event_checklists FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_edit_event(auth.uid(), e.id))
);
CREATE POLICY "Users can update checklists" ON public.event_checklists FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can delete checklists" ON public.event_checklists FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_event_owner_or_admin(auth.uid(), e.id))
);

-- EVENT_SHOPPING_LISTS
CREATE POLICY "Users can view shopping lists" ON public.event_shopping_lists FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can create shopping items" ON public.event_shopping_lists FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_edit_event(auth.uid(), e.id))
);
CREATE POLICY "Users can update shopping items" ON public.event_shopping_lists FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can delete shopping items" ON public.event_shopping_lists FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_event_owner_or_admin(auth.uid(), e.id))
);

-- EVENT_ATTACHMENTS
CREATE POLICY "Users can view attachments" ON public.event_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can upload attachments" ON public.event_attachments FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_edit_event(auth.uid(), e.id))
);
CREATE POLICY "Owners can delete attachments" ON public.event_attachments FOR DELETE USING (
  uploaded_by = auth.uid() OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.is_event_owner_or_admin(auth.uid(), e.id))
);

-- REMINDERS
CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create reminders" ON public.reminders FOR INSERT WITH CHECK (
  user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_access_calendar(auth.uid(), e.calendar_id))
);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendars_updated_at BEFORE UPDATE ON public.calendars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_checklists_updated_at BEFORE UPDATE ON public.event_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_shopping_lists_updated_at BEFORE UPDATE ON public.event_shopping_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER PARA CREAR CALENDARIO Y MEMBRESÍA AL CREAR EQUIPO
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear membresía para el owner
  INSERT INTO public.team_memberships (user_id, team_id, role, invited_by)
  VALUES (NEW.owner_id, NEW.id, 'owner', NEW.owner_id);
  
  -- Crear calendario por defecto para el equipo
  INSERT INTO public.calendars (name, team_id, owner_id, is_default, color)
  VALUES (NEW.name || ' - Principal', NEW.id, NEW.owner_id, true, NEW.color);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();

-- =====================================================
-- STORAGE BUCKET PARA ARCHIVOS ADJUNTOS
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('event-attachments', 'event-attachments', false, 10485760);

-- Política para ver archivos
CREATE POLICY "Users can view event attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'event-attachments' AND
  EXISTS (
    SELECT 1 FROM public.event_attachments ea
    JOIN public.events e ON ea.event_id = e.id
    WHERE ea.file_url LIKE '%' || name
    AND public.can_access_calendar(auth.uid(), e.calendar_id)
  )
);

-- Política para subir archivos
CREATE POLICY "Users can upload event attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-attachments' AND auth.uid() IS NOT NULL
);

-- Política para eliminar archivos
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-attachments' AND
  EXISTS (
    SELECT 1 FROM public.event_attachments ea
    WHERE ea.file_url LIKE '%' || name AND ea.uploaded_by = auth.uid()
  )
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_events_calendar_id ON public.events(calendar_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_end_time ON public.events(end_time);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_team_memberships_user_id ON public.team_memberships(user_id);
CREATE INDEX idx_team_memberships_team_id ON public.team_memberships(team_id);
CREATE INDEX idx_calendars_team_id ON public.calendars(team_id);
CREATE INDEX idx_calendars_owner_id ON public.calendars(owner_id);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX idx_reminders_event_id ON public.reminders(event_id);
CREATE INDEX idx_reminders_reminder_time ON public.reminders(reminder_time);