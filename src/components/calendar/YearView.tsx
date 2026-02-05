 import { useCalendar } from '@/context/CalendarContext';
 import { 
   startOfYear,
   eachMonthOfInterval,
   startOfMonth, 
   endOfMonth, 
   startOfWeek, 
   endOfWeek, 
   eachDayOfInterval, 
   isSameMonth, 
   isToday,
   format,
   parseISO,
   isSameDay
 } from 'date-fns';
 import { es } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 
 export function YearView() {
   const { currentDate, events, setCurrentDate, setView } = useCalendar();
   
   const yearStart = startOfYear(currentDate);
   const months = eachMonthOfInterval({ 
     start: yearStart, 
     end: new Date(currentDate.getFullYear(), 11, 31) 
   });
 
   const hasEventsOnDay = (day: Date) => {
     return events.some(event => {
       const eventStart = parseISO(event.start_time);
       return isSameDay(eventStart, day);
     });
   };
 
   const handleMonthClick = (month: Date) => {
     setCurrentDate(month);
     setView('month');
   };
 
   return (
     <div className="flex-1 p-4 zoom-transition">
       <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
         {months.map((month) => {
           const monthStart = startOfMonth(month);
           const monthEnd = endOfMonth(month);
           const calendarStart = startOfWeek(monthStart, { locale: es });
           const calendarEnd = endOfWeek(monthEnd, { locale: es });
           const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
           
           return (
             <div 
               key={month.toISOString()}
               onClick={() => handleMonthClick(month)}
               className="bg-card rounded-xl p-3 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
             >
               <h3 className="text-sm font-semibold mb-2 capitalize text-center">
                 {format(month, 'MMMM', { locale: es })}
               </h3>
               <div className="grid grid-cols-7 gap-0.5 text-xs">
                 {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => (
                   <div key={i} className="text-center text-muted-foreground text-[10px]">
                     {d}
                   </div>
                 ))}
                 {days.slice(0, 42).map((day, index) => {
                   const isCurrentMonth = isSameMonth(day, month);
                   const hasEvents = hasEventsOnDay(day);
                   
                   return (
                     <div
                       key={index}
                       className={cn(
                         "text-center text-[10px] py-0.5 rounded-sm",
                         !isCurrentMonth && "opacity-30",
                         isToday(day) && "bg-primary text-primary-foreground font-bold",
                         hasEvents && !isToday(day) && "bg-accent/30"
                       )}
                     >
                       {format(day, 'd')}
                     </div>
                   );
                 })}
               </div>
             </div>
           );
         })}
       </div>
     </div>
   );
 }