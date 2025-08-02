import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let error;
      if (isLogin) {
        ({ error } = await signIn(email, password));
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Erro",
            description: "Por favor, preencha seu nome completo.",
            variant: "destructive",
          });
          return;
        }
        ({ error } = await signUp(email, password, fullName));
      }

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else if (!isLogin) {
        toast({
          title: "Sucesso!",
          description: "Conta criada! Verifique seu email para confirmar.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">CasalFinance</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie suas finanças juntos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Entre na sua conta para continuar' 
                : 'Crie sua conta para começar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="mt-4 text-center text-sm">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                {' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? 'Criar conta' : 'Entrar'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}