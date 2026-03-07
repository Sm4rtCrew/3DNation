import { Construction, Sparkles } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-20" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-float">
          <Construction className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          {description || "Este módulo estará disponible próximamente. Estamos trabajando para traerte la mejor experiencia."}
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">En desarrollo</span>
        </div>
      </div>
    </div>
  );
}
