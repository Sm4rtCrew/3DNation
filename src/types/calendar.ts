 export type CalendarView = 'year' | 'month' | 'week' | 'day';
 
 export interface CalendarEvent {
   id: string;
   calendar_id: string;
   title: string;
   description?: string;
   location?: string;
   activity?: string;
   start_time: string;
   end_time: string;
   all_day: boolean;
   is_recurring: boolean;
   category_id?: string;
   color?: string;
   created_by: string;
   created_at: string;
   updated_at: string;
 }
 
 export interface Category {
   id: string;
   name: string;
   color: string;
   icon?: string;
   team_id?: string;
   user_id?: string;
 }
 
 export interface ChecklistItem {
   id: string;
   event_id: string;
   title: string;
   is_completed: boolean;
   sort_order: number;
 }
 
 export interface ShoppingItem {
   id: string;
   event_id: string;
   item_name: string;
   quantity: number;
   unit?: string;
   price?: number;
   is_purchased: boolean;
   sort_order: number;
 }
 
 export interface EventAttachment {
   id: string;
   event_id: string;
   file_url: string;
   file_name: string;
   file_type?: string;
   file_size?: number;
   uploaded_by: string;
 }
 
 export interface Team {
   id: string;
   name: string;
   description?: string;
   owner_id: string;
   color: string;
 }
 
 export interface Calendar {
   id: string;
   name: string;
   description?: string;
   team_id?: string;
   owner_id: string;
   color: string;
   is_default: boolean;
 }
 
 export interface Profile {
   id: string;
   email: string;
   full_name?: string;
   avatar_url?: string;
 }
 
 export const CALENDAR_COLORS = [
   '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
   '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
   '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
   '#ec4899', '#f43f5e'
 ];