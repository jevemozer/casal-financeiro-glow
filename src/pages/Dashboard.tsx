import { useAuth } from '@/hooks/useAuth';
import { useCasal } from '@/hooks/useCasal';
import { useContas } from '@/hooks/useContas';
import { useTransacoes } from '@/hooks/useTransacoes';
import { useMetas } from '@/hooks/useMetas';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Heart,
  LogOut,
  Plus,
  TrendingUp,
  Wallet,
  Target,
  ArrowRight,
  Clock,
  PiggyBank,
  BellRing,
  CreditCard,
  DollarSign,
  ChevronRight,
  Users,
  BarChart3,
  ActivitySquare,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import PartnerInvite from '@/components/PartnerInvite';
import { Notifications } from '@/components/Notifications';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { casal, refetch: refetchCasal } = useCasal();
  const { saldoTotal, loading: loadingContas } = useContas();
  const {
    gastosMes,
    transacoes,
    loading: loadingTransacoes,
  } = useTransacoes(5);
  const { metasAtivas, loading: loadingMetas } = useMetas();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
      {/* Header - Estilo Nubank com gradiente suave */}
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 animate-pulse" />
              <h1 className="text-2xl font-bold tracking-tight">CasalFinance</h1>
            </div>

            <div className="flex items-center gap-4">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <BellRing className="h-5 w-5" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Notificações</h4>
                      <p className="text-sm text-muted-foreground">
                        Veja suas notificações e alertas financeiros.
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
          
          {/* Subtítulo animado */}
          <p className="text-white/80 animate-in fade-in slide-in-from-bottom-1 duration-700">
            Bem-vindo ao seu espaço financeiro compartilhado
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-6">
        <div className="grid gap-6">
          {/* Card Principal - Saldo */}
          <Card className="bg-white shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-600">Saldo Total</CardTitle>
                <HoverCard>
                  <HoverCardTrigger>
                    <Wallet className="h-5 w-5 text-purple-500 hover:text-purple-600 transition-colors cursor-pointer" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className="text-sm">Saldo combinado de todas as suas contas</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-3xl font-bold tracking-tight">
                  {loadingContas ? (
                    <div className="h-8 w-32 animate-pulse bg-gray-200 rounded" />
                  ) : (
                    formatCurrency(saldoTotal)
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {saldoTotal === 0 ? 'Adicione suas contas para ver o saldo' : 'Atualizado agora'}
                </p>
              </div>
              
              {/* Mini Gráfico de Evolução */}
              <div className="h-[100px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: 'Jan', valor: saldoTotal * 0.7 },
                      { name: 'Fev', valor: saldoTotal * 0.8 },
                      { name: 'Mar', valor: saldoTotal * 0.9 },
                      { name: 'Abr', valor: saldoTotal },
                    ]}
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(147, 51, 234)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="rgb(147, 51, 234)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="rgb(147, 51, 234)"
                      fillOpacity={1}
                      fill="url(#colorSaldo)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card de Gastos */}
            <Card className="hover:shadow-md transition-all duration-200 group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
                  <ActivitySquare className="h-4 w-4 text-purple-500 group-hover:rotate-12 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-500">
                    {loadingTransacoes ? '...' : formatCurrency(gastosMes)}
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-red-500" />
                    15% maior que mês anterior
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card de Metas */}
            <Card className="hover:shadow-md transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate('/metas')}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Metas Financeiras</CardTitle>
                  <Target className="h-4 w-4 text-purple-500 group-hover:rotate-12 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {loadingMetas ? '...' : `${metasAtivas} ${metasAtivas === 1 ? 'meta' : 'metas'}`}
                  </div>
                  <Progress value={40} className="h-2" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    2 metas próximas de conclusão
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card de Orçamentos */}
            <Card className="hover:shadow-md transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate('/orcamentos')}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
                  <PiggyBank className="h-4 w-4 text-purple-500 group-hover:rotate-12 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-500">
                    85%
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-green-500" />
                    Dentro do planejado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-purple-50 group transition-all"
              onClick={() => navigate('/transacoes')}
            >
              <DollarSign className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Nova Transação</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-purple-50 group transition-all"
              onClick={() => navigate('/contas')}
            >
              <CreditCard className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Contas</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-purple-50 group transition-all"
              onClick={() => navigate('/orcamentos')}
            >
              <PiggyBank className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Orçamentos</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:bg-purple-50 group transition-all"
              onClick={() => navigate('/relatorios')}
            >
              <BarChart3 className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Relatórios</span>
            </Button>
          </div>

          {/* Convite de Parceiro e Transações Recentes em Grid */}
          <div className="grid md:grid-cols-5 gap-6">
            {/* Coluna do Convite */}
            <div className="md:col-span-2">
              <Card className="h-full bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-purple-500" />
                    Gestão Compartilhada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PartnerInvite casal={casal} onPartnerConnected={refetchCasal} />
                </CardContent>
              </Card>
            </div>

            {/* Coluna das Transações */}
            <div className="md:col-span-3">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <ActivitySquare className="h-5 w-5 text-purple-500" />
                      Transações Recentes
                    </CardTitle>
                    <CardDescription>
                      Últimas movimentações financeiras
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/transacoes')}
                    className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                  >
                    Ver todas
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {transacoes.map((transacao) => (
                        <div
                          key={transacao.id}
                          className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm group-hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: transacao.categorias?.cor || '#6b7280',
                              }}
                            >
                              {transacao.categorias?.icone?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transacao.descricao}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
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
                          <div
                            className={`text-sm font-semibold flex items-center gap-1
                              ${transacao.tipo === 'receita' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                              }`}
                          >
                            {transacao.tipo === 'receita' 
                              ? <ArrowUpRight className="h-4 w-4" />
                              : <ArrowDownRight className="h-4 w-4" />
                            }
                            {formatCurrency(Number(transacao.valor))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
