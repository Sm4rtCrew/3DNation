import { useState } from "react";
import { Building2, Plus, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Business {
  id: string;
  name: string;
  role: string;
  members: number;
  initial: string;
}

const mockBusinesses: Business[] = [
  { id: "1", name: "Acme Corp", role: "Propietario", members: 5, initial: "A" },
  { id: "2", name: "StartupXYZ", role: "Admin", members: 3, initial: "S" },
];

const roleColors: Record<string, string> = {
  Propietario: "bg-primary/10 text-primary",
  Admin: "bg-info/10 text-info",
};

export default function Businesses() {
  const [businesses] = useState<Business[]>(mockBusinesses);
  const isEmpty = businesses.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Negocios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada negocio es un espacio aislado con su propia data y miembros.
          </p>
        </div>
        <Button size="sm" className="gap-2 rounded-xl glow-sm">
          <Plus className="h-4 w-4" /> Crear negocio
        </Button>
      </div>

      {isEmpty ? (
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Sin negocios aún</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Crea tu primer espacio de trabajo para gestionar finanzas, miembros y herramientas.
            </p>
            <Button className="mt-6 gap-2 rounded-xl glow-sm">
              <Sparkles className="h-4 w-4" /> Crear primer negocio
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <Card key={b.id} className="group cursor-pointer border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    {b.initial}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${roleColors[b.role] || "bg-muted text-muted-foreground"}`}>
                    {b.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {b.members} miembros
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground group-hover:text-primary rounded-xl">
                  Entrar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
