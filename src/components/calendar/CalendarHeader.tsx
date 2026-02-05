 import { useCalendar } from '@/context/CalendarContext';
 import { useAuth } from '@/context/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { 
   ChevronLeft, 
   ChevronRight, 
   CalendarDays, 
   Plus, 
   ZoomIn, 
   ZoomOut,
   User,
   LogOut,
   Sun,
   Moon
 } from 'lucide-react';
 import { format, addMonths, subMonths, addYears, subYears, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
 import { es } from 'date-fns/locale';
 import { useState, useEffect } from 'react';
 
 export function CalendarHeader() {
   const { currentDate, setCurrentDate, view, setView, handleZoom, setIsEventModalOpen, setNewEventDate } = useCalendar();
   const { profile, signOut } = useAuth();
   const [isDark, setIsDark] = useState(false);
 
   useEffect(() => {
     const isDarkMode = document.documentElement.classList.contains('dark');
     setIsDark(isDarkMode);
   }, []);
 
   const toggleTheme = () => {
     document.documentElement.classList.toggle('dark');
     setIsDark(!isDark);
   };
 
   const navigatePrev = () => {
     switch (view) {
       case 'year':
         setCurrentDate(subYears(currentDate, 1));
         break;
       case 'month':
         setCurrentDate(subMonths(currentDate, 1));
         break;
       case 'week':
         setCurrentDate(subWeeks(currentDate, 1));
         break;
       case 'day':
         setCurrentDate(subDays(currentDate, 1));
         break;
     }
   };
 
   const navigateNext = () => {
     switch (view) {
       case 'year':
         setCurrentDate(addYears(currentDate, 1));
         break;
       case 'month':
         setCurrentDate(addMonths(currentDate, 1));
         break;
       case 'week':
         setCurrentDate(addWeeks(currentDate, 1));
         break;
       case 'day':
         setCurrentDate(addDays(currentDate, 1));
         break;
     }
   };
 
   const goToToday = () => setCurrentDate(new Date());
 
   const getDateLabel = () => {
     switch (view) {
       case 'year':
         return format(currentDate, 'yyyy', { locale: es });
       case 'month':
         return format(currentDate, 'MMMM yyyy', { locale: es });
       case 'week':
         return `Semana ${format(currentDate, 'w, yyyy', { locale: es })}`;
       case 'day':
         return format(currentDate, "EEEE, d 'de' MMMM", { locale: es });
     }
   };
 
   const handleNewEvent = () => {
     setNewEventDate(new Date());
     setIsEventModalOpen(true);
   };
 
   const viewLabels = {
     year: 'Año',
     month: 'Mes',
     week: 'Semana',
     day: 'Día'
   };
 
   return (
     <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
       <div className="flex items-center gap-4">
         <div className="flex items-center gap-2">
           <CalendarDays className="h-6 w-6 text-primary" />
           <span className="font-semibold text-lg hidden sm:inline">ChronoPlan</span>
         </div>
         
         <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" onClick={navigatePrev}>
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button variant="ghost" onClick={goToToday} className="min-w-[180px]">
             <span className="capitalize font-medium">{getDateLabel()}</span>
           </Button>
           <Button variant="ghost" size="icon" onClick={navigateNext}>
             <ChevronRight className="h-4 w-4" />
           </Button>
         </div>
       </div>
 
       <div className="flex items-center gap-2">
         <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
           {(['year', 'month', 'week', 'day'] as const).map((v) => (
             <Button
               key={v}
               variant={view === v ? 'secondary' : 'ghost'}
               size="sm"
               onClick={() => setView(v)}
               className="px-3"
             >
               {viewLabels[v]}
             </Button>
           ))}
         </div>
 
         <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
           <Button variant="ghost" size="icon" onClick={() => handleZoom('out')} title="Zoom out (Ctrl + Scroll down)">
             <ZoomOut className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" onClick={() => handleZoom('in')} title="Zoom in (Ctrl + Scroll up)">
             <ZoomIn className="h-4 w-4" />
           </Button>
         </div>
 
         <Button onClick={handleNewEvent} size="sm" className="gap-1">
           <Plus className="h-4 w-4" />
           <span className="hidden sm:inline">Nuevo Hito</span>
         </Button>
 
         <Button variant="ghost" size="icon" onClick={toggleTheme}>
           {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
         </Button>
 
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="icon">
               <User className="h-4 w-4" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
             <DropdownMenuItem disabled className="font-medium">
               {profile?.full_name || profile?.email}
             </DropdownMenuItem>
             <DropdownMenuItem onClick={signOut} className="text-destructive">
               <LogOut className="h-4 w-4 mr-2" />
               Cerrar sesión
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
     </header>
   );
 }