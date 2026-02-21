import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFinanceAuth } from "@/context/FinanceAuthContext";
import { useFinanceWS } from "@/context/FinanceWSContext";
import {
  TrendingUp, LayoutDashboard, ArrowLeftRight, Wallet, CreditCard,
  Tag, LogOut, ChevronDown, Building2, Menu, Plus, Wifi, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { path: "/funds", label: "Fondos", icon: Wallet },
  { path: "/cards", label: "Tarjetas", icon: CreditCard },
  { path: "/categories", label: "Categorías", icon: Tag },
];

interface Props { children: React.ReactNode }

export default function FinanceLayout({ children }: Props) {
  const { user, profile, businesses, activeBusiness, selectBusiness, logout, refreshBusinesses } = useFinanceAuth();
  const { connected } = useFinanceWS();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bizDropOpen, setBizDropOpen] = useState(false);
  const [showNewBiz, setShowNewBiz] = useState(false);
  const [newBizName, setNewBizName] = useState("");

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (item: (typeof NAV_ITEMS)[0]) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const createBusiness = async () => {
    if (!newBizName.trim() || !user) return;
    const { data: biz } = await supabase.from("businesses").insert({ name: newBizName.trim(), created_by: user.id }).select().single();
    if (biz) {
      await supabase.from("memberships").insert({ user_id: user.id, business_id: biz.id, role: "OWNER" });
      await refreshBusinesses();
      setNewBizName("");
      setShowNewBiz(false);
    }
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 shrink-0"
      style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid hsl(var(--sidebar-border))" }}>
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center neon-red shrink-0"
          style={{ background: "hsl(var(--primary) / 0.15)" }}>
          <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <div>
          <p className="font-bold text-sm neon-red-text">LedgerPro</p>
          <p className="text-[10px] text-muted-foreground">Contabilidad Empresarial</p>
        </div>
        <div className="ml-auto">
          <span title={connected ? "En línea" : "Sin conexión"}>
            {connected ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-b relative" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <button onClick={() => setBizDropOpen(v => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-sidebar-accent">
          <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="flex-1 text-left truncate font-medium">{activeBusiness?.name || "Sin negocio"}</span>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${bizDropOpen ? "rotate-180" : ""}`} />
        </button>
        {bizDropOpen && (
          <div className="absolute left-4 right-4 top-full mt-1 glass-card rounded-lg overflow-hidden z-50">
            {businesses.map((b) => (
              <button key={b.id} onClick={() => { selectBusiness(b); setBizDropOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                style={{ color: activeBusiness?.id === b.id ? "hsl(var(--primary))" : undefined }}>
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{b.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{b.role}</span>
              </button>
            ))}
            {!showNewBiz ? (
              <button onClick={() => setShowNewBiz(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                <Plus className="w-3 h-3" /> Nuevo negocio
              </button>
            ) : (
              <div className="px-3 py-2 flex gap-2">
                <Input value={newBizName} onChange={(e) => setNewBizName(e.target.value)} placeholder="Nombre..."
                  className="h-8 text-xs bg-muted border-border" onKeyDown={(e) => e.key === "Enter" && createBusiness()} />
                <Button size="sm" className="h-8 text-xs" onClick={createBusiness}
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>+</Button>
              </div>
            )}
            {businesses.length === 0 && !showNewBiz && <p className="px-3 py-2 text-xs text-muted-foreground">No hay negocios</p>}
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "hsl(var(--primary) / 0.15)" : "transparent",
                color: active ? "hsl(var(--primary))" : "hsl(var(--sidebar-foreground))",
                borderLeft: active ? "2px solid hsl(var(--primary))" : "2px solid transparent",
              }}>
              <item.icon className="w-4 h-4 shrink-0" />{item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}>
            {profile?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{profile?.full_name || "Usuario"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-finance-gradient">
      <div className="hidden md:flex"><Sidebar /></div>
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex"><Sidebar /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: "hsl(var(--sidebar-background))", borderColor: "hsl(var(--sidebar-border))" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-foreground"><Menu className="w-5 h-5" /></button>
          <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
          <span className="font-bold text-sm neon-red-text">LedgerPro</span>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
