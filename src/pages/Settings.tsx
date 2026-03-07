import { User, Shield, Bell, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/useTheme";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajustes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administra tu cuenta y preferencias.</p>
      </div>

      {/* Profile */}
      <Card className="border-border/50 bg-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            <User className="h-3.5 w-3.5" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Nombre completo</Label>
            <Input placeholder="Tu nombre" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Correo electrónico</Label>
            <Input type="email" placeholder="tu@empresa.com" className="h-11 rounded-xl" disabled />
          </div>
          <Button size="sm" className="rounded-xl">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/50 bg-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            <Palette className="h-3.5 w-3.5" /> Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Tema</p>
              <p className="text-xs text-muted-foreground">
                Actualmente: {theme === "dark" ? "Oscuro" : "Claro"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-xl">
              Cambiar a {theme === "dark" ? "claro" : "oscuro"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/50 bg-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            <Bell className="h-3.5 w-3.5" /> Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las preferencias de notificación estarán disponibles próximamente.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-border/50 bg-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            <Shield className="h-3.5 w-3.5" /> Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Contraseña</p>
              <p className="text-xs text-muted-foreground">Última actualización hace 30 días</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">Cambiar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Autenticación en dos pasos</p>
              <p className="text-xs text-muted-foreground">No configurada</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">Configurar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
