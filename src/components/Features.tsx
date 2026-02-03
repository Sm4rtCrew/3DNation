import { Printer, Zap, Shield, Truck } from "lucide-react";

const features = [
  {
    icon: Printer,
    title: "Tecnología Avanzada",
    description: "Impresoras de última generación para resultados perfectos en cada pieza.",
  },
  {
    icon: Zap,
    title: "Entrega Rápida",
    description: "Producción express en 24-48 horas para proyectos urgentes.",
  },
  {
    icon: Shield,
    title: "Calidad Garantizada",
    description: "Control de calidad riguroso y garantía en todos nuestros productos.",
  },
  {
    icon: Truck,
    title: "Envío Nacional",
    description: "Entregamos a todo el país con seguimiento en tiempo real.",
  },
];

const Features = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">¿Por qué </span>
            <span className="text-gradient">Elegirnos?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Combinamos tecnología de punta con atención personalizada para ofrecerte la mejor experiencia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 text-center group hover:glow-box transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
