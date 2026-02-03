import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "¡Hola! Me interesa obtener una cotización para impresión 3D. ¿Podrían ayudarme?"
    );
    const phoneNumber = "1234567890"; // Cambiar por tu número
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <section id="contacto" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">¿Tienes un </span>
              <span className="text-gradient">Proyecto?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Contáctanos para una cotización personalizada. Estamos listos para hacer realidad tu idea.
            </p>
          </div>

          <div className="glass-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                  Información de Contacto
                </h3>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">WhatsApp Business</p>
                    <p className="text-muted-foreground text-sm">+1 234 567 890</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-muted-foreground text-sm">contacto@printforge3d.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Teléfono</p>
                    <p className="text-muted-foreground text-sm">+1 234 567 890</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ubicación</p>
                    <p className="text-muted-foreground text-sm">Ciudad, País</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col justify-center items-center text-center p-6 bg-muted/30 rounded-xl">
                <div className="w-20 h-20 rounded-full bg-whatsapp/20 flex items-center justify-center mb-6 pulse-glow">
                  <MessageCircle className="w-10 h-10 text-whatsapp" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                  Respuesta Inmediata
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Escríbenos por WhatsApp y te responderemos en minutos.
                </p>
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="gap-3"
                  onClick={handleWhatsAppContact}
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
