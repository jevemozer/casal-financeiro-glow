import { useAuth } from '@/hooks/useAuth';
import { useCasal } from '@/hooks/useCasal';
import { useContas } from '@/hooks/useContas';
import { useTransacoes } from '@/hooks/useTransacoes';
import { useMetas } from '@/hooks/useMetas';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, LogOut, Plus, TrendingUp, Wallet, Target, ArrowRight, Clock } from 'lucide-react';
import PartnerInvite from '@/components/PartnerInvite';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { casal, refetch: refetchCasal } = useCasal();
  const { saldoTotal, loading: loadingContas } = useContas();
  const { gastosMes, transacoes, loading: loadingTransacoes } = useTransacoes(5);
  const { metasAtivas, loading: loadingMetas } = useMetas();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CasalFinance</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user.user_metadata?.full_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              Bem-vindo ao seu centro de controle financeiro
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingContas ? '...' : formatCurrency(saldoTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {saldoTotal === 0 ? 'Adicione suas contas para ver o saldo' : 'Saldo atual de todas as contas'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingTransacoes ? '...' : formatCurrency(gastosMes)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {gastosMes === 0 ? 'Registre transações para ver os gastos' : 'Gastos realizados este mês'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingMetas ? '...' : metasAtivas}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metasAtivas === 0 ? 'Crie metas para alcançar seus objetivos' : 'Metas ativas em andamento'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Setup Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PartnerInvite casal={casal} onPartnerConnected={refetchCasal} />

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Adicionar Contas
                </CardTitle>
                <CardDescription>
                  Configure suas contas bancárias e cartões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = '/contas'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Gerenciar Contas
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Primeira Transação
                </CardTitle>
                <CardDescription>
                  Registre suas primeiras receitas e despesas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/transacoes')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Transação
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transações Recentes */}
          {transacoes.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
                  <CardDescription>Últimas movimentações financeiras</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/transacoes')}
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transacoes.map((transacao) => (
                    <div key={transacao.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: transacao.categorias?.cor || '#6b7280' }}
                        >
                          {transacao.categorias?.icone?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transacao.descricao}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{transacao.categorias?.nome}</span>
                            <span>•</span>
                            <span>{transacao.contas?.nome}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(transacao.data_transacao)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${
                        transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Number(transacao.valor))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}