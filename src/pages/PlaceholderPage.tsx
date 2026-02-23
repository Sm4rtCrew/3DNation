import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Construction className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description || "Este módulo estará disponible próximamente. Estamos trabajando para traerte la mejor experiencia."}
      </p>
    </div>
  );
}
