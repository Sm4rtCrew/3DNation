import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Existing calendar auth
import { AuthProvider } from "@/context/AuthContext";

// Finance
import { FinanceAuthProvider, useFinanceAuth } from "@/context/FinanceAuthContext";
import { FinanceWSProvider } from "@/context/FinanceWSContext";

// Pages – Calendar (existing)
import CalendarPage from "./pages/Calendar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Pages – Finance
import FinanceLogin from "./pages/finance/FinanceLogin";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import FinanceTransactions from "./pages/finance/FinanceTransactions";
import FinanceFunds from "./pages/finance/FinanceFunds";
import FinanceCards from "./pages/finance/FinanceCards";
import FinanceCategories from "./pages/finance/FinanceCategories";
import FinanceLayout from "./components/finance/FinanceLayout";

const queryClient = new QueryClient();

/** Guard – redirects to /finance/login if not authenticated */
function FinanceGuard({ children }: { children: React.ReactNode }) {
  const { token } = useFinanceAuth();
  if (!token) return <Navigate to="/finance/login" replace />;
  return <FinanceWSProvider>{children}</FinanceWSProvider>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FinanceAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ── Calendar (existing) ── */}
              <Route path="/" element={<CalendarPage />} />
              <Route path="/auth" element={<Auth />} />

              {/* ── Finance module ── */}
              <Route path="/finance/login" element={<FinanceLogin />} />

              {/* Protected finance routes */}
              <Route
                path="/finance"
                element={
                  <FinanceGuard>
                    <FinanceLayout>
                      <FinanceDashboard />
                    </FinanceLayout>
                  </FinanceGuard>
                }
              />
              <Route
                path="/finance/transactions"
                element={
                  <FinanceGuard>
                    <FinanceLayout>
                      <FinanceTransactions />
                    </FinanceLayout>
                  </FinanceGuard>
                }
              />
              <Route
                path="/finance/funds"
                element={
                  <FinanceGuard>
                    <FinanceLayout>
                      <FinanceFunds />
                    </FinanceLayout>
                  </FinanceGuard>
                }
              />
              <Route
                path="/finance/cards"
                element={
                  <FinanceGuard>
                    <FinanceLayout>
                      <FinanceCards />
                    </FinanceLayout>
                  </FinanceGuard>
                }
              />
              <Route
                path="/finance/categories"
                element={
                  <FinanceGuard>
                    <FinanceLayout>
                      <FinanceCategories />
                    </FinanceLayout>
                  </FinanceGuard>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FinanceAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
