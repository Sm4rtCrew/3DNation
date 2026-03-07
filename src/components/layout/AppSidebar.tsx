import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  MessageSquare,
  CalendarDays,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Finanzas", icon: Receipt, path: "/finance" },
  { label: "Proyectos", icon: FolderKanban, path: "/projects" },
  { label: "Chat", icon: MessageSquare, path: "/chat" },
  { label: "Calendario", icon: CalendarDays, path: "/calendar" },
  { label: "Negocios", icon: Building2, path: "/businesses" },
];

const bottomItems = [
  { label: "Ajustes", icon: Settings, path: "/settings" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ collapsed, onToggle }: Props) {
  const { pathname } = useLocation();

  const renderItem = (item: typeof navItems[0]) => {
    const active = pathname === item.path;
    const link = (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "group/item relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-primary" />
        )}
        <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active && "text-primary")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return link;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-foreground">
            Financial Core
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Principal
          </span>
        )}
        {navItems.map(renderItem)}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-border px-3 py-3">
        {bottomItems.map(renderItem)}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-muted-foreground/50 hover:text-foreground mt-1"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
