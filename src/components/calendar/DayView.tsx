 import { useCalendar } from '@/context/CalendarContext';
 import { 
   eachHourOfInterval,
   startOfDay,
   endOfDay,
   isSameDay, 
   isToday,
   format,
   parseISO,
   getHours,
   getMinutes
 } from 'date-fns';
 import { es } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 import { ScrollArea } from '@/components/ui/scroll-area';
 
 export function DayView() {
   const { currentDate, events, setNewEventDate, setIsEventModalOpen, setSelectedEvent } = useCalendar();
   
   const hours = eachHourOfInterval({ start: startOfDay(currentDate), end: endOfDay(currentDate) });
 
   const getDayEvents = () => {
     return events.filter(event => {
       const eventStart = parseISO(event.start_time);
       return isSameDay(eventStart, currentDate);
     });
   };
 
   const getEventPosition = (event: typeof events[0]) => {
     const eventStart = parseISO(event.start_time);
     const eventEnd = parseISO(event.end_time);
     const startHour = getHours(eventStart) + getMinutes(eventStart) / 60;
     const endHour = getHours(eventEnd) + getMinutes(eventEnd) / 60;
     const duration = endHour - startHour;
     
     return {
       top: `${startHour * 64}px`,
       height: `${Math.max(duration * 64, 32)}px`,
     };
   };
 
   const handleCellClick = (hour: number) => {
     const date = new Date(currentDate);
     date.setHours(hour, 0, 0, 0);
     setNewEventDate(date);
     setIsEventModalOpen(true);
   };
 
   const handleEventClick = (event: typeof events[0], e: React.MouseEvent) => {
     e.stopPropagation();
     setSelectedEvent(event);
     setIsEventModalOpen(true);
   };
 
   const dayEvents = getDayEvents();
 
   return (
     <div className="flex-1 flex flex-col zoom-transition">
       <div className={cn(
         "p-4 border-b border-border text-center",
         isToday(currentDate) && "bg-primary/10"
       )}>
         <div className="text-sm text-muted-foreground">
           {format(currentDate, 'EEEE', { locale: es })}
         </div>
         <div className={cn(
           "text-4xl font-bold",
           isToday(currentDate) && "text-primary"
         )}>
           {format(currentDate, 'd')}
         </div>
         <div className="text-sm text-muted-foreground">
           {format(currentDate, 'MMMM yyyy', { locale: es })}
         </div>
       </div>
       
       <ScrollArea className="flex-1">
         <div className="relative min-h-[1536px]">
           {hours.map((hour, index) => (
             <div
               key={hour.toISOString()}
               onClick={() => handleCellClick(getHours(hour))}
               className="flex h-16 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
             >
               <div className="w-20 p-2 text-xs text-muted-foreground text-right shrink-0 border-r border-border">
                 {format(hour, 'HH:mm')}
               </div>
               <div className="flex-1" />
             </div>
           ))}
           
           <div className="absolute top-0 left-20 right-0 bottom-0 pointer-events-none">
             {dayEvents.map((event) => {
               const position = getEventPosition(event);
               return (
                 <div
                   key={event.id}
                   onClick={(e) => handleEventClick(event, e)}
                   className="absolute left-1 right-4 rounded-lg p-2 text-white cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto"
                   style={{ 
                     backgroundColor: event.color || '#6366f1',
                     ...position
                   }}
                 >
                   <div className="font-medium text-sm truncate">{event.title}</div>
                   {event.location && (
                     <div className="text-xs opacity-80 truncate">{event.location}</div>
                   )}
                   <div className="text-xs opacity-80">
                     {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
       </ScrollArea>
     </div>
   );
 }