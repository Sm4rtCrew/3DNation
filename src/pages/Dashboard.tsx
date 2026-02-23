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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const shortcuts = [
  { label: "Finanzas", description: "Contabilidad y reportes", icon: Receipt, path: "/finance", color: "text-info" },
  { label: "Chat", description: "Mensajería interna", icon: MessageSquare, path: "/chat", color: "text-success" },
  { label: "Calendario", description: "Eventos y planificación", icon: CalendarDays, path: "/calendar", color: "text-warning" },
  { label: "Negocios", description: "Gestión multi-tenant", icon: Building2, path: "/businesses", color: "text-primary" },
];

const stats = [
  { label: "Ingresos del mes", value: "$12,450", change: "+8.2%", positive: true, icon: TrendingUp },
  { label: "Gastos del mes", value: "$7,230", change: "+2.1%", positive: false, icon: TrendingDown },
  { label: "Balance neto", value: "$5,220", change: "+15.4%", positive: true, icon: Activity },
];

const recentActivity = [
  { action: "Factura #1042 registrada", time: "Hace 2 min" },
  { action: "Pago recibido — Cliente ABC", time: "Hace 15 min" },
  { action: "Nuevo miembro agregado al negocio", time: "Hace 1 hora" },
  { action: "Categoría 'Marketing' creada", time: "Hace 3 horas" },
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bienvenido de vuelta
        </h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{today}</p>
      </div>

      {/* Shortcuts */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Accesos rápidos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((s) => (
            <Link key={s.path} to={s.path}>
              <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Estado rápido
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <s.icon className={`h-4 w-4 ${s.positive ? "text-success" : "text-destructive"}`} />
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
                <p className={`mt-1 text-xs font-medium ${s.positive ? "text-success" : "text-destructive"}`}>
                  {s.change} vs. mes anterior
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent activity */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-foreground">{a.action}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <p className="text-sm text-foreground">Último inicio de sesión</p>
              <span className="text-xs text-muted-foreground">Hoy, 9:42 AM</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <p className="text-sm text-foreground">Dispositivo</p>
              <span className="text-xs text-muted-foreground">Chrome · macOS</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Autenticación</p>
              <span className="text-xs font-medium text-success">Activa</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
