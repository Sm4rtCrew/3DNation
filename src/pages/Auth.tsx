 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/context/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useToast } from '@/hooks/use-toast';
 import { CalendarDays, Loader2 } from 'lucide-react';
 import { z } from 'zod';
 
 const emailSchema = z.string().email('Correo electrónico inválido');
 const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');
 
 export default function Auth() {
   const [isLoading, setIsLoading] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [fullName, setFullName] = useState('');
   const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
   const { signIn, signUp } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
 
   const validateForm = (isSignUp: boolean) => {
     const newErrors: typeof errors = {};
     
     try {
       emailSchema.parse(email);
     } catch (e) {
       if (e instanceof z.ZodError) {
         newErrors.email = e.errors[0].message;
       }
     }
     
     try {
       passwordSchema.parse(password);
     } catch (e) {
       if (e instanceof z.ZodError) {
         newErrors.password = e.errors[0].message;
       }
     }
     
     if (isSignUp && !fullName.trim()) {
       newErrors.fullName = 'El nombre es requerido';
     }
     
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSignIn = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validateForm(false)) return;
     
     setIsLoading(true);
     const { error } = await signIn(email, password);
     setIsLoading(false);
     
     if (error) {
       toast({
         title: 'Error al iniciar sesión',
         description: error.message === 'Invalid login credentials' 
           ? 'Credenciales incorrectas' 
           : error.message,
         variant: 'destructive',
       });
     } else {
       navigate('/');
     }
   };
 
   const handleSignUp = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validateForm(true)) return;
     
     setIsLoading(true);
     const { error } = await signUp(email, password, fullName);
     setIsLoading(false);
     
     if (error) {
       if (error.message.includes('already registered')) {
         toast({
           title: 'Usuario ya registrado',
           description: 'Este correo ya está registrado. Intenta iniciar sesión.',
           variant: 'destructive',
         });
       } else {
         toast({
           title: 'Error al registrarse',
           description: error.message,
           variant: 'destructive',
         });
       }
     } else {
       toast({
         title: '¡Registro exitoso!',
         description: 'Revisa tu correo para confirmar tu cuenta.',
       });
     }
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-background p-4">
       <div className="w-full max-w-md animate-scale-in">
         <div className="flex items-center justify-center gap-3 mb-8">
           <div className="p-3 rounded-xl bg-primary/10">
             <CalendarDays className="h-8 w-8 text-primary" />
           </div>
           <h1 className="text-3xl font-bold">ChronoPlan</h1>
         </div>
         
         <Card className="border-border/50 shadow-lg">
           <CardHeader className="text-center">
             <CardTitle>Bienvenido</CardTitle>
             <CardDescription>
               Tu calendario interactivo con zoom inteligente
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Tabs defaultValue="signin" className="w-full">
               <TabsList className="grid w-full grid-cols-2 mb-6">
                 <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                 <TabsTrigger value="signup">Registrarse</TabsTrigger>
               </TabsList>
               
               <TabsContent value="signin">
                 <form onSubmit={handleSignIn} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signin-email">Correo electrónico</Label>
                     <Input
                       id="signin-email"
                       type="email"
                       placeholder="tu@email.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.email && (
                       <p className="text-sm text-destructive">{errors.email}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signin-password">Contraseña</Label>
                     <Input
                       id="signin-password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.password && (
                       <p className="text-sm text-destructive">{errors.password}</p>
                     )}
                   </div>
                   <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Iniciar Sesión
                   </Button>
                 </form>
               </TabsContent>
               
               <TabsContent value="signup">
                 <form onSubmit={handleSignUp} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signup-name">Nombre completo</Label>
                     <Input
                       id="signup-name"
                       type="text"
                       placeholder="Tu nombre"
                       value={fullName}
                       onChange={(e) => setFullName(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.fullName && (
                       <p className="text-sm text-destructive">{errors.fullName}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signup-email">Correo electrónico</Label>
                     <Input
                       id="signup-email"
                       type="email"
                       placeholder="tu@email.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.email && (
                       <p className="text-sm text-destructive">{errors.email}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signup-password">Contraseña</Label>
                     <Input
                       id="signup-password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       disabled={isLoading}
                     />
                     {errors.password && (
                       <p className="text-sm text-destructive">{errors.password}</p>
                     )}
                   </div>
                   <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Crear Cuenta
                   </Button>
                 </form>
               </TabsContent>
             </Tabs>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }