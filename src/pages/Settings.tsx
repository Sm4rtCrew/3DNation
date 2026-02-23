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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ajustes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administra tu cuenta y preferencias.</p>
      </div>

      {/* Profile */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-muted-foreground" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Nombre completo</Label>
            <Input placeholder="Tu nombre" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Correo electrónico</Label>
            <Input type="email" placeholder="tu@empresa.com" className="h-10" disabled />
          </div>
          <Button size="sm">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4 text-muted-foreground" /> Apariencia
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
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Cambiar a {theme === "dark" ? "claro" : "oscuro"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4 text-muted-foreground" /> Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las preferencias de notificación estarán disponibles próximamente.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4 text-muted-foreground" /> Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Contraseña</p>
              <p className="text-xs text-muted-foreground">Última actualización hace 30 días</p>
            </div>
            <Button variant="outline" size="sm">Cambiar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Autenticación en dos pasos</p>
              <p className="text-xs text-muted-foreground">No configurada</p>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
