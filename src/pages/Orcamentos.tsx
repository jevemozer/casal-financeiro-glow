import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCasal } from '@/hooks/useCasal';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Plus,
  PiggyBank,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingButton } from '@/components/ui/loading';
import {
  orcamentoSchema,
  type OrcamentoFormData,
} from '@/lib/validations/orcamento';
import { cn } from '@/lib/utils';

interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
}

interface Orcamento {
  id: string;
  categoria_id: string;
  valor_limite: number;
  mes: number;
  ano: number;
  created_at: string;
  categorias: Categoria;
}

interface GastoCategoria {
  categoria_id: string;
  total: number;
}

export default function Orcamentos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { casal } = useCasal();
  const { toast } = useToast();

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [gastosCategoria, setGastosCategoria] = useState<GastoCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(
    null,
  );
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAno, setSelectedAno] = useState(new Date().getFullYear());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState({
    categoria_id: '',
    valor_limite: '',
  });

  useEffect(() => {
    if (user && casal?.id) {
      fetchData();
    }
  }, [user, casal?.id, selectedMes, selectedAno]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchData = async () => {
    if (!casal?.id) return;

    try {
      // Buscar categorias de despesa
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .eq('casal_id', casal.id)
        .eq('tipo', 'despesa')
        .order('nome');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Buscar orçamentos do mês/ano selecionado
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from('orcamentos')
        .select(
          `
          *,
          categorias(id, nome, icone, cor)
        `,
        )
        .eq('casal_id', casal.id)
        .eq('mes', selectedMes)
        .eq('ano', selectedAno);

      if (orcamentosError) throw orcamentosError;
      setOrcamentos(orcamentosData || []);

      // Buscar gastos por categoria no mês/ano selecionado
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('categoria_id, valor')
        .eq('casal_id', casal.id)
        .eq('tipo', 'despesa')
        .gte(
          'data_transacao',
          `${selectedAno}-${selectedMes.toString().padStart(2, '0')}-01`,
        )
        .lt(
          'data_transacao',
          `${selectedAno}-${(selectedMes + 1).toString().padStart(2, '0')}-01`,
        );

      if (transacoesError) throw transacoesError;

      // Agregar gastos por categoria
      const gastosAgrupados = (transacoesData || []).reduce(
        (acc: { [key: string]: number }, transacao) => {
          acc[transacao.categoria_id] =
            (acc[transacao.categoria_id] || 0) + Number(transacao.valor);
          return acc;
        },
        {},
      );

      setGastosCategoria(
        Object.entries(gastosAgrupados).map(([categoria_id, total]) => ({
          categoria_id,
          total,
        })),
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [casal?.id, selectedMes, selectedAno]);

  // Validação em tempo real
  const validateField = (field: string, value: string | number) => {
    if (!isValidating) return;

    try {
      const testData = {
        ...formData,
        [field]: value,
        mes: selectedMes,
        ano: selectedAno,
      };
      const result = orcamentoSchema.safeParse(testData);

      if (!result.success) {
        const fieldError = result.error.errors.find((error) =>
          error.path.includes(field),
        );
        setFieldErrors((prev) => ({
          ...prev,
          [field]: fieldError?.message || '',
        }));
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      // Ignora erros de validação durante digitação
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async () => {
    if (!casal?.id) return;

    setSubmitting(true);
    setIsValidating(true);

    // Limpar erros anteriores
    setFieldErrors({});

    // Preparar dados para validação
    const validationData = {
      categoria_id: formData.categoria_id,
      valor_limite: formData.valor_limite,
      mes: selectedMes,
      ano: selectedAno,
    };

    // Validar dados com Zod
    const validationResult = orcamentoSchema.safeParse(validationData);

    if (!validationResult.success) {
      const errors = validationResult.error.errors;

      // Mapear erros por campo
      const newFieldErrors: Record<string, string> = {};
      errors.forEach((error) => {
        const field = error.path[0] as string;
        newFieldErrors[field] = error.message;
      });

      setFieldErrors(newFieldErrors);

      // Mostrar primeiro erro como toast
      const firstError = errors[0];
      toast({
        title: 'Erro de Validação',
        description: firstError.message,
        variant: 'destructive',
      });

      setSubmitting(false);
      return;
    }

    try {
      const validatedData = validationResult.data;
      const orcamentoData = {
        categoria_id: validatedData.categoria_id,
        valor_limite: parseFloat(validatedData.valor_limite),
        mes: validatedData.mes,
        ano: validatedData.ano,
        casal_id: casal.id,
      };

      if (editingOrcamento) {
        const { error } = await supabase
          .from('orcamentos')
          .update(orcamentoData)
          .eq('id', editingOrcamento.id);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Orçamento atualizado com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('orcamentos')
          .insert([orcamentoData]);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Orçamento criado com sucesso!',
        });
      }

      setDialogOpen(false);
      setEditingOrcamento(null);
      setFormData({ categoria_id: '', valor_limite: '' });
      setFieldErrors({});
      fetchData();
    } catch (error) {
      console.error('Error saving orcamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o orçamento.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setFormData({
      categoria_id: orcamento.categoria_id,
      valor_limite: orcamento.valor_limite.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (orcamento: Orcamento) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;

    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', orcamento.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Orçamento excluído com sucesso!',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting orcamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o orçamento.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getGastoCategoria = (categoriaId: string) => {
    const gasto = gastosCategoria.find((g) => g.categoria_id === categoriaId);
    return gasto?.total || 0;
  };

  const getProgress = (gasto: number, limite: number) => {
    return Math.min((gasto / limite) * 100, 100);
  };

  const getStatusColor = (gasto: number, limite: number) => {
    const progress = (gasto / limite) * 100;
    if (progress >= 100) return 'text-red-600';
    if (progress >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAvailableCategories = () => {
    const orcamentoCategorias = orcamentos.map((o) => o.categoria_id);
    return categorias.filter((c) => !orcamentoCategorias.includes(c.id));
  };

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CasalFinance</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <span className="text-sm text-muted-foreground">
              Olá, {user.user_metadata?.full_name || user.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Orçamentos</h2>
            <p className="text-muted-foreground">
              Controle seus gastos por categoria
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
                </DialogTitle>
                <DialogDescription>
                  Defina um limite de gastos para uma categoria específica.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria_id">Categoria</Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) =>
                      handleInputChange('categoria_id', value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        fieldErrors.categoria_id &&
                          'border-destructive focus:ring-destructive',
                      )}
                    >
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCategories().map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.categoria_id && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.categoria_id}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_limite">Valor Limite</Label>
                  <Input
                    id="valor_limite"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valor_limite}
                    onChange={(e) =>
                      handleInputChange('valor_limite', e.target.value)
                    }
                    className={cn(
                      fieldErrors.valor_limite &&
                        'border-destructive focus:ring-destructive',
                    )}
                  />
                  {fieldErrors.valor_limite && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.valor_limite}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mês</Label>
                    <Select
                      value={selectedMes.toString()}
                      onValueChange={(value) => setSelectedMes(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Janeiro</SelectItem>
                        <SelectItem value="2">Fevereiro</SelectItem>
                        <SelectItem value="3">Março</SelectItem>
                        <SelectItem value="4">Abril</SelectItem>
                        <SelectItem value="5">Maio</SelectItem>
                        <SelectItem value="6">Junho</SelectItem>
                        <SelectItem value="7">Julho</SelectItem>
                        <SelectItem value="8">Agosto</SelectItem>
                        <SelectItem value="9">Setembro</SelectItem>
                        <SelectItem value="10">Outubro</SelectItem>
                        <SelectItem value="11">Novembro</SelectItem>
                        <SelectItem value="12">Dezembro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Select
                      value={selectedAno.toString()}
                      onValueChange={(value) => setSelectedAno(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: 5 },
                          (_, i) => new Date().getFullYear() + i,
                        ).map((ano) => (
                          <SelectItem key={ano} value={ano.toString()}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingOrcamento(null);
                      setFormData({ categoria_id: '', valor_limite: '' });
                      setFieldErrors({});
                    }}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <LoadingButton
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={submitting || Object.keys(fieldErrors).length > 0}
                  >
                    {submitting
                      ? 'Salvando...'
                      : editingOrcamento
                      ? 'Atualizar'
                      : 'Criar Orçamento'}
                  </LoadingButton>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {orcamentos.length === 0 ? (
          <div className="text-center py-12">
            <PiggyBank className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum orçamento criado</h2>
            <p className="text-muted-foreground mb-6">
              Comece criando orçamentos para controlar seus gastos por
              categoria.
            </p>
            {getAvailableCategories().length > 0 && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Orçamento
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                Orçamentos - {meses[selectedMes - 1]} {selectedAno}
              </h2>
              <p className="text-muted-foreground">
                Acompanhe seus gastos e mantenha-se dentro do orçamento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orcamentos.map((orcamento) => {
                const gasto = getGastoCategoria(orcamento.categoria_id);
                const progress = getProgress(gasto, orcamento.valor_limite);
                const restante = orcamento.valor_limite - gasto;
                const isOver = gasto > orcamento.valor_limite;

                return (
                  <Card
                    key={orcamento.id}
                    className={`relative ${
                      isOver ? 'ring-2 ring-red-200' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{
                              backgroundColor: orcamento.categorias.cor,
                            }}
                          >
                            {orcamento.categorias.icone.charAt(0)}
                          </div>
                          <CardTitle className="text-lg">
                            {orcamento.categorias.nome}
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(orcamento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(orcamento)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Gasto</span>
                          <span
                            className={getStatusColor(
                              gasto,
                              orcamento.valor_limite,
                            )}
                          >
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className={`h-2 ${
                            isOver ? '[&>div]:bg-red-500' : ''
                          }`}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatCurrency(gasto)}</span>
                          <span>{formatCurrency(orcamento.valor_limite)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          {isOver ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <span
                            className={
                              isOver ? 'text-red-600' : 'text-green-600'
                            }
                          >
                            {isOver
                              ? 'Orçamento estourado'
                              : 'Dentro do orçamento'}
                          </span>
                        </div>
                        <div
                          className={`font-semibold ${
                            isOver ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {isOver ? '-' : ''}
                          {formatCurrency(Math.abs(restante))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
