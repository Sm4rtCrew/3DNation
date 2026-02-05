 import { useCalendar } from '@/context/CalendarContext';
 import { 
   startOfMonth, 
   endOfMonth, 
   startOfWeek, 
   endOfWeek, 
   eachDayOfInterval, 
   isSameMonth, 
   isSameDay, 
   isToday,
   format,
   parseISO
 } from 'date-fns';
 import { es } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 
 const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
 
 export function MonthView() {
   const { currentDate, events, setCurrentDate, setView, setNewEventDate, setIsEventModalOpen, setSelectedEvent } = useCalendar();
   
   const monthStart = startOfMonth(currentDate);
   const monthEnd = endOfMonth(currentDate);
   const calendarStart = startOfWeek(monthStart, { locale: es });
   const calendarEnd = endOfWeek(monthEnd, { locale: es });
   
   const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
 
   const getEventsForDay = (day: Date) => {
     return events.filter(event => {
       const eventStart = parseISO(event.start_time);
       return isSameDay(eventStart, day);
     });
   };
 
   const handleDayClick = (day: Date) => {
     setNewEventDate(day);
     setIsEventModalOpen(true);
   };
 
   const handleDayDoubleClick = (day: Date) => {
     setCurrentDate(day);
     setView('day');
   };
 
   const handleEventClick = (event: typeof events[0], e: React.MouseEvent) => {
     e.stopPropagation();
     setSelectedEvent(event);
     setIsEventModalOpen(true);
   };
 
   return (
     <div className="flex-1 flex flex-col p-4 zoom-transition">
       <div className="calendar-grid mb-2">
         {WEEKDAYS.map((day) => (
           <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
             {day}
           </div>
         ))}
       </div>
       
       <div className="calendar-grid flex-1">
         {days.map((day, index) => {
           const dayEvents = getEventsForDay(day);
           const isCurrentMonth = isSameMonth(day, currentDate);
           const isCurrentDay = isToday(day);
           
           return (
             <div
               key={index}
               onClick={() => handleDayClick(day)}
               onDoubleClick={() => handleDayDoubleClick(day)}
               className={cn(
                 "calendar-cell cursor-pointer",
                 !isCurrentMonth && "opacity-40",
                 isCurrentDay && "calendar-cell-today"
               )}
             >
               <div className={cn(
                 "text-sm mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                 isCurrentDay && "bg-primary text-primary-foreground font-semibold"
               )}>
                 {format(day, 'd')}
               </div>
               
               <div className="space-y-1 overflow-hidden">
                 {dayEvents.slice(0, 3).map((event) => (
                   <div
                     key={event.id}
                     onClick={(e) => handleEventClick(event, e)}
                     className="event-chip text-white"
                     style={{ backgroundColor: event.color || '#6366f1' }}
                     title={event.title}
                   >
                     {event.title}
                   </div>
                 ))}
                 {dayEvents.length > 3 && (
                   <div className="text-xs text-muted-foreground pl-2">
                     +{dayEvents.length - 3} más
                   </div>
                 )}
               </div>
             </div>
           );
         })}
       </div>
     </div>
   );
 }