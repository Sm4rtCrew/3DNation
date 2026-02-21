export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      balances: {
        Row: {
          balance: number
          business_id: string
          entity_id: string
          entity_type: string
          id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          business_id: string
          entity_id: string
          entity_type: string
          id?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          business_id?: string
          entity_id?: string
          entity_type?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "balances_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          business_id: string
          category_id: string | null
          created_at: string
          id: string
          monthly_limit: number
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string
          id?: string
          monthly_limit?: number
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string
          id?: string
          monthly_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_permissions: {
        Row: {
          calendar_id: string
          created_at: string
          id: string
          permission_level: Database["public"]["Enums"]["permission_level"]
          user_id: string
        }
        Insert: {
          calendar_id: string
          created_at?: string
          id?: string
          permission_level?: Database["public"]["Enums"]["permission_level"]
          user_id: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          id?: string
          permission_level?: Database["public"]["Enums"]["permission_level"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_permissions_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendars: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          owner_id: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          owner_id: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          owner_id?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendars_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          allow_overlimit: boolean
          available_credit: number
          business_id: string
          closing_day: number
          created_at: string
          credit_limit: number
          due_day: number
          id: string
          name: string
          overlimit_limit: number | null
          updated_at: string
        }
        Insert: {
          allow_overlimit?: boolean
          available_credit?: number
          business_id: string
          closing_day: number
          created_at?: string
          credit_limit?: number
          due_day: number
          id?: string
          name: string
          overlimit_limit?: number | null
          updated_at?: string
        }
        Update: {
          allow_overlimit?: boolean
          available_credit?: number
          business_id?: string
          closing_day?: number
          created_at?: string
          credit_limit?: number
          due_day?: number
          id?: string
          name?: string
          overlimit_limit?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          name: string
          team_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attachments: {
        Row: {
          created_at: string
          event_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          event_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          event_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attachments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: Database["public"]["Enums"]["attendee_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: Database["public"]["Enums"]["attendee_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["attendee_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checklists: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_completed: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_completed?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_completed?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_checklists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_shopping_lists: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_purchased: boolean | null
          item_name: string
          price: number | null
          quantity: number | null
          sort_order: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_purchased?: boolean | null
          item_name: string
          price?: number | null
          quantity?: number | null
          sort_order?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_purchased?: boolean | null
          item_name?: string
          price?: number | null
          quantity?: number | null
          sort_order?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_shopping_lists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          activity: string | null
          all_day: boolean | null
          calendar_id: string
          category_id: string | null
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          location: string | null
          recurrence_rule_id: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          activity?: string | null
          all_day?: boolean | null
          calendar_id: string
          category_id?: string | null
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_rule_id?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          activity?: string | null
          all_day?: boolean | null
          calendar_id?: string
          category_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_rule_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_recurrence_rule_id_fkey"
            columns: ["recurrence_rule_id"]
            isOneToOne: false
            referencedRelation: "recurrence_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_categories: {
        Row: {
          business_id: string
          color: string
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          fund_type: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          fund_type?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          fund_type?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funds_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurrence_rules: {
        Row: {
          by_monthday: number[] | null
          by_weekday: number[] | null
          count: number | null
          created_at: string
          frequency: Database["public"]["Enums"]["recurrence_frequency"]
          id: string
          interval_value: number
          until_date: string | null
        }
        Insert: {
          by_monthday?: number[] | null
          by_weekday?: number[] | null
          count?: number | null
          created_at?: string
          frequency: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          interval_value?: number
          until_date?: string | null
        }
        Update: {
          by_monthday?: number[] | null
          by_weekday?: number[] | null
          count?: number | null
          created_at?: string
          frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          interval_value?: number
          until_date?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_sent: boolean | null
          method: Database["public"]["Enums"]["reminder_method"]
          reminder_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_sent?: boolean | null
          method?: Database["public"]["Enums"]["reminder_method"]
          reminder_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_sent?: boolean | null
          method?: Database["public"]["Enums"]["reminder_method"]
          reminder_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          is_active: boolean
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_legs: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          signed_amount: number
          transaction_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          signed_amount: number
          transaction_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          signed_amount?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_legs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          business_id: string
          category_id: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          tx_date: string
          tx_type: string
        }
        Insert: {
          amount: number
          business_id: string
          category_id?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          tx_date?: string
          tx_type: string
        }
        Update: {
          amount?: number
          business_id?: string
          category_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          tx_date?: string
          tx_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_calendar: {
        Args: { check_calendar_id: string; check_user_id: string }
        Returns: boolean
      }
      can_edit_event: {
        Args: { check_event_id: string; check_user_id: string }
        Returns: boolean
      }
      is_business_member: { Args: { biz_id: string }; Returns: boolean }
      is_calendar_owner_or_admin: {
        Args: { check_calendar_id: string; check_user_id: string }
        Returns: boolean
      }
      is_event_owner_or_admin: {
        Args: { check_event_id: string; check_user_id: string }
        Returns: boolean
      }
      is_team_admin: {
        Args: { check_team_id: string; check_user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { check_team_id: string; check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      attendee_status: "pending" | "accepted" | "declined" | "maybe"
      permission_level: "owner" | "admin" | "editor" | "viewer"
      recurrence_frequency: "daily" | "weekly" | "monthly" | "yearly"
      reminder_method: "notification" | "email" | "both"
      team_role: "owner" | "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendee_status: ["pending", "accepted", "declined", "maybe"],
      permission_level: ["owner", "admin", "editor", "viewer"],
      recurrence_frequency: ["daily", "weekly", "monthly", "yearly"],
      reminder_method: ["notification", "email", "both"],
      team_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
