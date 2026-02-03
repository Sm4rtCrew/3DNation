const Footer = () => {
  return (
    <footer className="py-8 border-t border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-display font-bold text-sm">3D</span>
            </div>
            <span className="font-display text-lg font-bold text-gradient">
              PrintForge
            </span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            © 2024 PrintForge 3D. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
