import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinanceAuth } from "@/context/FinanceAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, TrendingUp, Lock, Mail, User, AlertCircle, CheckCircle2 } from "lucide-react";

type Mode = "login" | "register";

export default function FinanceLogin() {
  const { login, register, loading } = useFinanceAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else {
        if (password.length < 8) { setError("La contraseña debe tener mínimo 8 caracteres."); return; }
        await register(email, password, fullName);
        setSuccess("Cuenta creada. Ahora puedes iniciar sesión.");
        setMode("login");
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    }
  };

  return (
    <div className="min-h-screen bg-finance-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: "hsl(var(--primary))" }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl opacity-5"
        style={{ background: "hsl(var(--primary))" }} />

      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 neon-red"
            style={{ background: "hsl(var(--primary) / 0.15)" }}>
            <TrendingUp className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight neon-red-text">LedgerPro</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Plataforma Contable Empresarial
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: "hsl(var(--muted))" }}>
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === m ? "hsl(var(--primary))" : "transparent",
                  color: mode === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  boxShadow: mode === m ? "0 0 12px hsl(var(--primary) / 0.4)" : "none",
                }}
              >
                {m === "login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div className="space-y-2 slide-up">
                <Label htmlFor="fullName" className="text-sm font-medium">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10 bg-muted border-border focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10 bg-muted border-border focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pl-10 pr-10 bg-muted border-border focus:border-primary focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 slide-up">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2 slide-up">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-5 text-sm neon-red"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : mode === "login" ? "Acceder al Sistema" : "Crear Cuenta"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Conexión segura con FastAPI · JWT · bcrypt
          </p>
        </div>

        {/* Decorative bottom */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          Sistema Contable v1.0 · Moneda COP
        </div>
      </div>
    </div>
  );
}
