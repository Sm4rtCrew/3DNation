 import React, { createContext, useContext, useState, useCallback } from 'react';
 import type { CalendarView, CalendarEvent, Calendar, Category } from '@/types/calendar';
 
 interface CalendarContextType {
   currentDate: Date;
   setCurrentDate: (date: Date) => void;
   view: CalendarView;
   setView: (view: CalendarView) => void;
   zoomLevel: number;
   handleZoom: (direction: 'in' | 'out') => void;
   events: CalendarEvent[];
   setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
   calendars: Calendar[];
   setCalendars: React.Dispatch<React.SetStateAction<Calendar[]>>;
   categories: Category[];
   setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
   selectedCalendars: string[];
   toggleCalendar: (calendarId: string) => void;
   selectedEvent: CalendarEvent | null;
   setSelectedEvent: (event: CalendarEvent | null) => void;
   isEventModalOpen: boolean;
   setIsEventModalOpen: (open: boolean) => void;
   newEventDate: Date | null;
   setNewEventDate: (date: Date | null) => void;
 }
 
 const CalendarContext = createContext<CalendarContextType | undefined>(undefined);
 
 const VIEW_ORDER: CalendarView[] = ['year', 'month', 'week', 'day'];
 
 export function CalendarProvider({ children }: { children: React.ReactNode }) {
   const [currentDate, setCurrentDate] = useState(new Date());
   const [view, setView] = useState<CalendarView>('month');
   const [zoomLevel, setZoomLevel] = useState(1);
   const [events, setEvents] = useState<CalendarEvent[]>([]);
   const [calendars, setCalendars] = useState<Calendar[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
   const [isEventModalOpen, setIsEventModalOpen] = useState(false);
   const [newEventDate, setNewEventDate] = useState<Date | null>(null);
 
   const handleZoom = useCallback((direction: 'in' | 'out') => {
     const currentIndex = VIEW_ORDER.indexOf(view);
     
     if (direction === 'in' && currentIndex < VIEW_ORDER.length - 1) {
       setView(VIEW_ORDER[currentIndex + 1]);
       setZoomLevel(prev => Math.min(prev + 0.25, 2));
     } else if (direction === 'out' && currentIndex > 0) {
       setView(VIEW_ORDER[currentIndex - 1]);
       setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
     }
   }, [view]);
 
   const toggleCalendar = useCallback((calendarId: string) => {
     setSelectedCalendars(prev => 
       prev.includes(calendarId) 
         ? prev.filter(id => id !== calendarId)
         : [...prev, calendarId]
     );
   }, []);
 
   return (
     <CalendarContext.Provider value={{
       currentDate,
       setCurrentDate,
       view,
       setView,
       zoomLevel,
       handleZoom,
       events,
       setEvents,
       calendars,
       setCalendars,
       categories,
       setCategories,
       selectedCalendars,
       toggleCalendar,
       selectedEvent,
       setSelectedEvent,
       isEventModalOpen,
       setIsEventModalOpen,
       newEventDate,
       setNewEventDate,
     }}>
       {children}
     </CalendarContext.Provider>
   );
 }
 
 export function useCalendar() {
   const context = useContext(CalendarContext);
   if (context === undefined) {
     throw new Error('useCalendar must be used within a CalendarProvider');
   }
   return context;
 }