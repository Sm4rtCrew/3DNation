 import { useCalendar } from '@/context/CalendarContext';
 import { useCalendarData } from '@/hooks/useCalendarData';
 import { useAuth } from '@/context/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Checkbox } from '@/components/ui/checkbox';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Plus, Calendar, Users } from 'lucide-react';
 import { useEffect } from 'react';
 
 export function CalendarSidebar() {
   const { calendars, selectedCalendars, toggleCalendar, setCalendars } = useCalendar();
   const { createDefaultCalendar, fetchCalendars } = useCalendarData();
   const { user } = useAuth();
 
   useEffect(() => {
     const initCalendars = async () => {
       if (user && calendars.length === 0) {
         const defaultCalendar = await createDefaultCalendar();
         if (defaultCalendar) {
           setCalendars([defaultCalendar]);
           toggleCalendar(defaultCalendar.id);
         }
       } else if (calendars.length > 0 && selectedCalendars.length === 0) {
         calendars.forEach(cal => {
           if (!selectedCalendars.includes(cal.id)) {
             toggleCalendar(cal.id);
           }
         });
       }
     };
     
     initCalendars();
   }, [user, calendars.length]);
 
   return (
     <aside className="w-64 border-r border-border bg-card/30 flex flex-col">
       <div className="p-4 border-b border-border">
         <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
           Mis Calendarios
         </h2>
         <ScrollArea className="h-[200px]">
           <div className="space-y-2">
             {calendars.map((calendar) => (
               <label
                 key={calendar.id}
                 className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
               >
                 <Checkbox
                   checked={selectedCalendars.includes(calendar.id)}
                   onCheckedChange={() => toggleCalendar(calendar.id)}
                   style={{ 
                     borderColor: calendar.color,
                     backgroundColor: selectedCalendars.includes(calendar.id) ? calendar.color : 'transparent'
                   }}
                 />
                 <div className="flex items-center gap-2 flex-1 min-w-0">
                   <Calendar className="h-4 w-4 shrink-0" style={{ color: calendar.color }} />
                   <span className="text-sm truncate">{calendar.name}</span>
                 </div>
               </label>
             ))}
           </div>
         </ScrollArea>
       </div>
 
       <div className="p-4 border-b border-border">
         <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
           Equipos
         </h2>
         <div className="text-sm text-muted-foreground flex items-center gap-2 p-2">
           <Users className="h-4 w-4" />
           <span>Sin equipos aún</span>
         </div>
         <Button variant="ghost" size="sm" className="w-full mt-2 gap-2">
           <Plus className="h-4 w-4" />
           Crear equipo
         </Button>
       </div>
 
       <div className="p-4 mt-auto">
         <div className="text-xs text-muted-foreground space-y-1">
           <p className="font-medium">Atajos de teclado:</p>
           <p>• Ctrl + Scroll: Cambiar vista</p>
           <p>• Click en día: Crear evento</p>
         </div>
       </div>
     </aside>
   );
 }