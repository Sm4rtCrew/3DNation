 import { useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/context/AuthContext';
 import { useCalendar } from '@/context/CalendarContext';
 import { useToast } from '@/hooks/use-toast';
 import type { CalendarEvent, Calendar, Category } from '@/types/calendar';
 
 export function useCalendarData() {
   const { user } = useAuth();
   const { 
     setEvents, 
     setCalendars, 
     setCategories,
     selectedCalendars,
   } = useCalendar();
   const { toast } = useToast();
 
   const fetchCalendars = useCallback(async () => {
     if (!user) return;
     
     const { data, error } = await supabase
       .from('calendars')
       .select('*')
       .order('created_at', { ascending: true });
     
     if (error) {
       console.error('Error fetching calendars:', error);
       return;
     }
     
     if (data) {
       setCalendars(data as Calendar[]);
     }
   }, [user, setCalendars]);
 
   const fetchCategories = useCallback(async () => {
     if (!user) return;
     
     const { data, error } = await supabase
       .from('categories')
       .select('*')
       .order('name', { ascending: true });
     
     if (error) {
       console.error('Error fetching categories:', error);
       return;
     }
     
     if (data) {
       setCategories(data as Category[]);
     }
   }, [user, setCategories]);
 
   const fetchEvents = useCallback(async () => {
     if (!user || selectedCalendars.length === 0) {
       setEvents([]);
       return;
     }
     
     const { data, error } = await supabase
       .from('events')
       .select('*')
       .in('calendar_id', selectedCalendars)
       .order('start_time', { ascending: true });
     
     if (error) {
       console.error('Error fetching events:', error);
       return;
     }
     
     if (data) {
       setEvents(data as CalendarEvent[]);
     }
   }, [user, selectedCalendars, setEvents]);
 
   const createDefaultCalendar = useCallback(async () => {
     if (!user) return null;
     
     const { data, error } = await supabase
       .from('calendars')
       .insert({
         name: 'Mi Calendario',
         owner_id: user.id,
         color: '#6366f1',
         is_default: true
       })
       .select()
       .single();
     
     if (error) {
       toast({
         title: 'Error',
         description: 'No se pudo crear el calendario por defecto',
         variant: 'destructive',
       });
       return null;
     }
     
     return data as Calendar;
   }, [user, toast]);
 
   const createEvent = useCallback(async (eventData: Partial<CalendarEvent>) => {
     if (!user) return null;
     
     const { data, error } = await supabase
       .from('events')
      .insert([{
        calendar_id: eventData.calendar_id!,
        title: eventData.title!,
        start_time: eventData.start_time!,
        end_time: eventData.end_time!,
        description: eventData.description,
        location: eventData.location,
        activity: eventData.activity,
        all_day: eventData.all_day ?? false,
        is_recurring: eventData.is_recurring ?? false,
        category_id: eventData.category_id,
        color: eventData.color,
        created_by: user.id,
      }])
       .select()
       .single();
     
     if (error) {
       toast({
         title: 'Error',
         description: 'No se pudo crear el evento',
         variant: 'destructive',
       });
       return null;
     }
     
     toast({
       title: 'Evento creado',
       description: 'El evento se ha creado correctamente',
     });
     
     await fetchEvents();
     return data as CalendarEvent;
   }, [user, toast, fetchEvents]);
 
   const updateEvent = useCallback(async (eventId: string, eventData: Partial<CalendarEvent>) => {
     const { error } = await supabase
       .from('events')
       .update(eventData)
       .eq('id', eventId);
     
     if (error) {
       toast({
         title: 'Error',
         description: 'No se pudo actualizar el evento',
         variant: 'destructive',
       });
       return false;
     }
     
     toast({
       title: 'Evento actualizado',
       description: 'El evento se ha actualizado correctamente',
     });
     
     await fetchEvents();
     return true;
   }, [toast, fetchEvents]);
 
   const deleteEvent = useCallback(async (eventId: string) => {
     const { error } = await supabase
       .from('events')
       .delete()
       .eq('id', eventId);
     
     if (error) {
       toast({
         title: 'Error',
         description: 'No se pudo eliminar el evento',
         variant: 'destructive',
       });
       return false;
     }
     
     toast({
       title: 'Evento eliminado',
       description: 'El evento se ha eliminado correctamente',
     });
     
     await fetchEvents();
     return true;
   }, [toast, fetchEvents]);
 
   useEffect(() => {
     fetchCalendars();
     fetchCategories();
   }, [fetchCalendars, fetchCategories]);
 
   useEffect(() => {
     fetchEvents();
   }, [fetchEvents]);
 
   return {
     fetchCalendars,
     fetchCategories,
     fetchEvents,
     createDefaultCalendar,
     createEvent,
     updateEvent,
     deleteEvent,
   };
 }