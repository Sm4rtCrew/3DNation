import { useState } from "react";
import { Building2, Plus, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Business {
  id: string;
  name: string;
  role: string;
  members: number;
}

const mockBusinesses: Business[] = [
  { id: "1", name: "Acme Corp", role: "Propietario", members: 5 },
  { id: "2", name: "StartupXYZ", role: "Admin", members: 3 },
];

export default function Businesses() {
  const [businesses] = useState<Business[]>(mockBusinesses);
  const isEmpty = businesses.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Negocios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus espacios de trabajo. Cada negocio tiene su propio contexto.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Crear negocio
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-medium text-foreground">Sin negocios aún</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Crea tu primer espacio de trabajo para comenzar a gestionar finanzas, miembros y más.
          </p>
          <Button className="mt-6 gap-2">
            <Plus className="h-4 w-4" /> Crear primer negocio
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <Card key={b.id} className="group cursor-pointer border-border bg-card transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {b.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{b.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {b.members} miembros
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground group-hover:text-primary">
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
