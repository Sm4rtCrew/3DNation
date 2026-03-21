import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Businesses from "@/pages/Businesses";
import Settings from "@/pages/Settings";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";
import InvoiceDemo from "@/pages/InvoiceDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/finance" element={<PlaceholderPage title="Finanzas" description="Contabilidad, transacciones, reportes y análisis financiero — próximamente." />} />
            <Route path="/projects" element={<PlaceholderPage title="Proyectos" description="Gestión de proyectos, tareas y seguimiento de progreso — próximamente." />} />
            <Route path="/chat" element={<PlaceholderPage title="Chat" description="Mensajería interna en tiempo real para tu equipo — próximamente." />} />
            <Route path="/calendar" element={<PlaceholderPage title="Calendario" description="Eventos, planificación y recordatorios inteligentes — próximamente." />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
