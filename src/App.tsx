import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { FinanceAuthProvider, useFinanceAuth } from "@/context/FinanceAuthContext";
import { FinanceWSProvider } from "@/context/FinanceWSContext";

import FinanceLogin from "./pages/finance/FinanceLogin";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import FinanceTransactions from "./pages/finance/FinanceTransactions";
import FinanceFunds from "./pages/finance/FinanceFunds";
import FinanceCards from "./pages/finance/FinanceCards";
import FinanceCategories from "./pages/finance/FinanceCategories";
import FinanceLayout from "./components/finance/FinanceLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function FinanceGuard({ children }: { children: React.ReactNode }) {
  const { token, loading } = useFinanceAuth();
  if (loading) return (
    <div className="min-h-screen bg-finance-gradient flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  return <FinanceWSProvider>{children}</FinanceWSProvider>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FinanceAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<FinanceLogin />} />
            <Route path="/" element={<FinanceGuard><FinanceLayout><FinanceDashboard /></FinanceLayout></FinanceGuard>} />
            <Route path="/transactions" element={<FinanceGuard><FinanceLayout><FinanceTransactions /></FinanceLayout></FinanceGuard>} />
            <Route path="/funds" element={<FinanceGuard><FinanceLayout><FinanceFunds /></FinanceLayout></FinanceGuard>} />
            <Route path="/cards" element={<FinanceGuard><FinanceLayout><FinanceCards /></FinanceLayout></FinanceGuard>} />
            <Route path="/categories" element={<FinanceGuard><FinanceLayout><FinanceCategories /></FinanceLayout></FinanceGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </FinanceAuthProvider>
  </QueryClientProvider>
);

export default App;
