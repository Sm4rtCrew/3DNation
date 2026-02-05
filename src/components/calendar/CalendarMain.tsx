 import { useEffect, useCallback } from 'react';
 import { useCalendar } from '@/context/CalendarContext';
 import { YearView } from './YearView';
 import { MonthView } from './MonthView';
 import { WeekView } from './WeekView';
 import { DayView } from './DayView';
 
 export function CalendarMain() {
   const { view, handleZoom } = useCalendar();
 
   const handleWheel = useCallback((e: WheelEvent) => {
     if (e.ctrlKey) {
       e.preventDefault();
       if (e.deltaY < 0) {
         handleZoom('in');
       } else {
         handleZoom('out');
       }
     }
   }, [handleZoom]);
 
   useEffect(() => {
     const container = document.getElementById('calendar-main');
     if (container) {
       container.addEventListener('wheel', handleWheel, { passive: false });
       return () => container.removeEventListener('wheel', handleWheel);
     }
   }, [handleWheel]);
 
   return (
     <main id="calendar-main" className="flex-1 flex flex-col overflow-hidden bg-background">
       {view === 'year' && <YearView />}
       {view === 'month' && <MonthView />}
       {view === 'week' && <WeekView />}
       {view === 'day' && <DayView />}
     </main>
   );
 }