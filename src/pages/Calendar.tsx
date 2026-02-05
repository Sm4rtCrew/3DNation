 import { useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/context/AuthContext';
 import { CalendarProvider } from '@/context/CalendarContext';
 import { CalendarHeader } from '@/components/calendar/CalendarHeader';
 import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
 import { CalendarMain } from '@/components/calendar/CalendarMain';
 import { EventModal } from '@/components/calendar/EventModal';
 import { useCalendarData } from '@/hooks/useCalendarData';
 import { Loader2 } from 'lucide-react';
 
 function CalendarContent() {
   useCalendarData();
   
   return (
     <div className="h-screen flex flex-col">
       <CalendarHeader />
       <div className="flex-1 flex overflow-hidden">
         <CalendarSidebar />
         <CalendarMain />
       </div>
       <EventModal />
     </div>
   );
 }
 
 export default function CalendarPage() {
   const { user, loading } = useAuth();
   const navigate = useNavigate();
 
   useEffect(() => {
     if (!loading && !user) {
       navigate('/auth');
     }
   }, [user, loading, navigate]);
 
   if (loading) {
     return (
       <div className="h-screen flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!user) {
     return null;
   }
 
   return (
     <CalendarProvider>
       <CalendarContent />
     </CalendarProvider>
   );
 }