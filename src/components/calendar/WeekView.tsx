 import { useCalendar } from '@/context/CalendarContext';
 import { 
   startOfWeek, 
   endOfWeek, 
   eachDayOfInterval, 
   eachHourOfInterval,
   startOfDay,
   endOfDay,
   isSameDay, 
   isToday,
   format,
   parseISO,
   getHours
 } from 'date-fns';
 import { es } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 import { ScrollArea } from '@/components/ui/scroll-area';
 
 export function WeekView() {
   const { currentDate, events, setCurrentDate, setView, setNewEventDate, setIsEventModalOpen, setSelectedEvent } = useCalendar();
   
   const weekStart = startOfWeek(currentDate, { locale: es });
   const weekEnd = endOfWeek(currentDate, { locale: es });
   const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
   const hours = eachHourOfInterval({ start: startOfDay(currentDate), end: endOfDay(currentDate) });
 
   const getEventsForDayHour = (day: Date, hour: number) => {
     return events.filter(event => {
       const eventStart = parseISO(event.start_time);
       return isSameDay(eventStart, day) && getHours(eventStart) === hour;
     });
   };
 
   const handleCellClick = (day: Date, hour: number) => {
     const date = new Date(day);
     date.setHours(hour, 0, 0, 0);
     setNewEventDate(date);
     setIsEventModalOpen(true);
   };
 
   const handleEventClick = (event: typeof events[0], e: React.MouseEvent) => {
     e.stopPropagation();
     setSelectedEvent(event);
     setIsEventModalOpen(true);
   };
 
   return (
     <div className="flex-1 flex flex-col zoom-transition">
       <div className="grid grid-cols-8 border-b border-border">
         <div className="p-2 text-center text-xs text-muted-foreground">
           Hora
         </div>
         {days.map((day) => (
           <div 
             key={day.toISOString()} 
             className={cn(
               "p-2 text-center border-l border-border",
               isToday(day) && "bg-primary/10"
             )}
           >
             <div className="text-xs text-muted-foreground">
               {format(day, 'EEE', { locale: es })}
             </div>
             <div className={cn(
               "text-lg font-semibold",
               isToday(day) && "text-primary"
             )}>
               {format(day, 'd')}
             </div>
           </div>
         ))}
       </div>
       
       <ScrollArea className="flex-1">
         <div className="grid grid-cols-8">
           {hours.map((hour) => (
             <div key={hour.toISOString()} className="contents">
               <div className="p-2 text-xs text-muted-foreground text-right border-b border-border h-16 flex items-start justify-end">
                 {format(hour, 'HH:mm')}
               </div>
               {days.map((day) => {
                 const hourEvents = getEventsForDayHour(day, getHours(hour));
                 return (
                   <div
                     key={`${day.toISOString()}-${hour.toISOString()}`}
                     onClick={() => handleCellClick(day, getHours(hour))}
                     className={cn(
                       "border-l border-b border-border h-16 p-1 cursor-pointer hover:bg-muted/50 transition-colors",
                       isToday(day) && "bg-primary/5"
                     )}
                   >
                     {hourEvents.map((event) => (
                       <div
                         key={event.id}
                         onClick={(e) => handleEventClick(event, e)}
                         className="event-chip text-white text-xs"
                         style={{ backgroundColor: event.color || '#6366f1' }}
                       >
                         {event.title}
                       </div>
                     ))}
                   </div>
                 );
               })}
             </div>
           ))}
         </div>
       </ScrollArea>
     </div>
   );
 }