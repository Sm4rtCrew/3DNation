import { Link } from "react-router-dom";
import {
  Receipt,
  MessageSquare,
  CalendarDays,
  Building2,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  ArrowRight,
  FolderKanban,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  { label: "Finanzas", description: "Contabilidad, transacciones y reportes", icon: Receipt, path: "/finance", gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15", iconColor: "text-primary" },
  { label: "Proyectos", description: "Gestión y seguimiento de proyectos", icon: FolderKanban, path: "/projects", gradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/15 dark:to-indigo-500/15", iconColor: "text-info" },
  { label: "Chat", description: "Mensajería interna en tiempo real", icon: MessageSquare, path: "/chat", gradient: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15", iconColor: "text-violet-500" },
  { label: "Calendario", description: "Eventos, agenda y recordatorios", icon: CalendarDays, path: "/calendar", gradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15", iconColor: "text-warning" },
  { label: "Negocios", description: "Gestión multi-tenant de espacios", icon: Building2, path: "/businesses", gradient: "from-pink-500/10 to-rose-500/10 dark:from-pink-500/15 dark:to-rose-500/15", iconColor: "text-pink-500" },
];

const stats = [
  { label: "Ingresos del mes", value: "$12,450", change: "+8.2%", positive: true, icon: TrendingUp },
  { label: "Gastos del mes", value: "$7,230", change: "+2.1%", positive: false, icon: TrendingDown },
  { label: "Balance neto", value: "$5,220", change: "+15.4%", positive: true, icon: Activity },
];

const recentActivity = [
  { action: "Factura #1042 registrada", time: "Hace 2 min", dot: "bg-primary" },
  { action: "Pago recibido — Cliente ABC", time: "Hace 15 min", dot: "bg-info" },
  { action: "Nuevo miembro agregado al negocio", time: "Hace 1 hora", dot: "bg-warning" },
  { action: "Categoría 'Marketing' creada", time: "Hace 3 horas", dot: "bg-muted-foreground/30" },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">{today}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-4 py-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">Todo operativo</span>
        </div>
      </div>

      {/* Services Grid */}
      <section>
        <h2 className="mb-4 text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">
          Servicios
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((s) => (
            <Link key={s.path} to={s.path}>
              <Card className={`group cursor-pointer border-border/50 bg-gradient-to-br ${s.gradient} transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                      <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="mb-4 text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">
          Resumen financiero
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/50 bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <s.icon className={`h-4 w-4 ${s.positive ? "text-success" : "text-destructive"}`} />
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
                <p className={`mt-1 text-xs font-semibold ${s.positive ? "text-success" : "text-destructive"}`}>
                  {s.change} <span className="font-normal text-muted-foreground">vs. mes anterior</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent activity */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-border/30 py-3.5 last:border-0 last:pb-0 first:pt-0">
                <span className={`h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                <p className="flex-1 text-sm text-foreground">{a.action}</p>
                <span className="shrink-0 text-xs text-muted-foreground/60">{a.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <div className="flex items-center justify-between border-b border-border/30 py-3.5 first:pt-0">
              <p className="text-sm text-foreground">Último inicio de sesión</p>
              <span className="text-xs text-muted-foreground/60">Hoy, 9:42 AM</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/30 py-3.5">
              <p className="text-sm text-foreground">Dispositivo</p>
              <span className="text-xs text-muted-foreground/60">Chrome · macOS</span>
            </div>
            <div className="flex items-center justify-between py-3.5 last:pb-0">
              <p className="text-sm text-foreground">Autenticación</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
                Activa
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
