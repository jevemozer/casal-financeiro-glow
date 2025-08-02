import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Users, TrendingUp, Target, PieChart } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CasalFinance</h1>
          </div>
          <Link to="/auth">
            <Button>Entrar</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Finanças em Casal, Simplificadas
          </h2>
          <p className="text-xl text-muted-foreground">
            Gerencie o dinheiro do casal de forma transparente, colaborativa e organizada. 
            Construam juntos um futuro financeiro sólido.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="px-8">
                Começar Agora
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Por que escolher o CasalFinance?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desenvolvido especialmente para casais que querem ter controle total sobre suas finanças compartilhadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Colaborativo</CardTitle>
              <CardDescription>
                Ambos os parceiros podem acessar e gerenciar as finanças em tempo real
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Seguro</CardTitle>
              <CardDescription>
                Seus dados financeiros protegidos com criptografia de ponta a ponta
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Controle Completo</CardTitle>
              <CardDescription>
                Acompanhe receitas, despesas e o progresso das suas metas financeiras
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Metas Compartilhadas</CardTitle>
              <CardDescription>
                Definam e alcancem objetivos financeiros juntos, como casa própria ou viagem
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <PieChart className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Relatórios Visuais</CardTitle>
              <CardDescription>
                Gráficos e relatórios que facilitam o entendimento dos gastos do casal
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <Heart className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Relacionamento Saudável</CardTitle>
              <CardDescription>
                Promove transparência e comunicação sobre dinheiro no relacionamento
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground border-none shadow-xl">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold mb-4">
              Prontos para transformar suas finanças?
            </h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Junte-se aos casais que já descobriram como é fácil gerenciar dinheiro em equipe
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="px-8">
                Criar Conta Gratuita
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 CasalFinance. Construindo futuros financeiros juntos.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
