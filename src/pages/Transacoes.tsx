import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCasal } from '@/hooks/useCasal';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingCard, LoadingButton } from '@/components/ui/loading';
import { toast } from 'sonner';
import {
  Heart,
  LogOut,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Trash2,
  Edit,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  transacaoSchema,
  type TransacaoFormData,
} from '@/lib/validations/transacao';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data_transacao: string;
  categoria_id: string;
  conta_id: string;
  user_id: string;
  recorrente: boolean;
  frequencia_recorrencia: string | null;
  categorias: { nome: string; cor: string; icone: string } | null;
  contas: { nome: string; tipo: string } | null;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
}

interface Conta {
  id: string;
  nome: string;
  tipo: string;
  saldo: number;
}

export default function Transacoes() {
  const { user, signOut } = useAuth();
  const { casal } = useCasal();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    data_transacao: new Date().toISOString().split('T')[0],
    categoria_id: '',
    conta_id: '',
    recorrente: false,
    frequencia_recorrencia: '',
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!casal?.status || casal.status !== 'ativo') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa ter um parceiro conectado para gerenciar transações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              className="w-full"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchData();
  }, [casal]);

  const fetchData = async () => {
    if (!casal?.id) return;

    setLoading(true);
    try {
      // Fetch transactions
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select(
          `
          *,
          categorias:categoria_id(nome, cor, icone),
          contas:conta_id(nome, tipo)
        `,
        )
        .eq('casal_id', casal.id)
        .order('data_transacao', { ascending: false });

      if (transacoesError) throw transacoesError;
      setTransacoes((transacoesData || []) as Transacao[]);

      // Fetch categories
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .eq('casal_id', casal.id)
        .order('nome');

      if (categoriasError) throw categoriasError;
      setCategorias((categoriasData || []) as Categoria[]);

      // Fetch accounts
      const { data: contasData, error: contasError } = await supabase
        .from('contas')
        .select('*')
        .eq('casal_id', casal.id)
        .order('nome');

      if (contasError) throw contasError;
      setContas(contasData || []);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validar dados com Zod
    const validationResult = transacaoSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      const firstError = errors[0];
      toast.error(firstError.message);
      setSubmitting(false);
      return;
    }

    if (!casal?.id) {
      toast.error('Erro: Casal não encontrado');
      setSubmitting(false);
      return;
    }

    try {
      const validatedData = validationResult.data;

      const { error } = await supabase.from('transacoes').insert({
        descricao: validatedData.descricao,
        valor: parseFloat(validatedData.valor),
        tipo: validatedData.tipo,
        data_transacao: validatedData.data_transacao,
        categoria_id: validatedData.categoria_id,
        conta_id: validatedData.conta_id,
        user_id: user.id,
        casal_id: casal.id,
        recorrente: validatedData.recorrente,
        frequencia_recorrencia: validatedData.recorrente
          ? validatedData.frequencia_recorrencia
          : null,
      });

      if (error) throw error;

      toast.success('Transação adicionada com sucesso!');
      setOpen(false);
      setFormData({
        descricao: '',
        valor: '',
        tipo: 'despesa',
        data_transacao: new Date().toISOString().split('T')[0],
        categoria_id: '',
        conta_id: '',
        recorrente: false,
        frequencia_recorrencia: '',
      });
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao adicionar transação: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTransacao = async (id: string) => {
    try {
      const { error } = await supabase.from('transacoes').delete().eq('id', id);

      if (error) throw error;
      toast.success('Transação excluída com sucesso!');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao excluir transação: ' + error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const filteredCategorias = categorias.filter(
    (cat) => cat.tipo === formData.tipo,
  );

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = '/contas')}
            >
              Contas
            </Button>
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.full_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Transações</h2>
              <p className="text-muted-foreground">
                Gerencie suas receitas e despesas
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Transação</DialogTitle>
                  <DialogDescription>
                    Registre uma nova receita ou despesa
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: 'receita' | 'despesa') =>
                        setFormData({
                          ...formData,
                          tipo: value,
                          categoria_id: '',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      placeholder="Ex: Salário, Supermercado..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) =>
                        setFormData({ ...formData, valor: e.target.value })
                      }
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={formData.categoria_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoria_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conta">Conta</Label>
                    <Select
                      value={formData.conta_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, conta_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>
                            {conta.nome} ({conta.tipo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data_transacao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_transacao: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <LoadingButton
                    type="submit"
                    className="w-full"
                    loading={submitting}
                    loadingText="Adicionando transação..."
                  >
                    Adicionar Transação
                  </LoadingButton>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <LoadingCard key={i} size="md" lines={2} />
              ))}
            </div>
          ) : transacoes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece registrando sua primeira transação
                </p>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Transação
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transacoes.map((transacao) => (
                <Card key={transacao.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            transacao.tipo === 'receita'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {transacao.tipo === 'receita' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {transacao.descricao}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transacao.categorias?.nome}</span>
                            <span>•</span>
                            <span>{transacao.contas?.nome}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(transacao.data_transacao)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              transacao.tipo === 'receita'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transacao.tipo === 'receita' ? '+' : '-'}
                            {formatCurrency(transacao.valor)}
                          </div>
                          {transacao.recorrente && (
                            <Badge variant="secondary" className="text-xs">
                              Recorrente
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTransacao(transacao.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
