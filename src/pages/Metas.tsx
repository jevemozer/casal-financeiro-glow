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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Plus,
  Target,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingButton } from '@/components/ui/loading';
import { metaSchema, type MetaFormData } from '@/lib/validations/meta';
import { cn } from '@/lib/utils';

interface Meta {
  id: string;
  titulo: string;
  descricao: string | null;
  valor_objetivo: number;
  valor_atual: number;
  data_objetivo: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Metas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { casal } = useCasal();
  const { toast } = useToast();

  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_objetivo: '',
    data_objetivo: '',
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchMetas = async () => {
    if (!casal?.id) return;

    try {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('casal_id', casal.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMetas(data || []);
    } catch (error) {
      console.error('Error fetching metas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as metas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, [casal?.id]);

  // Validação em tempo real
  const validateField = (field: string, value: string | number) => {
    if (!isValidating) return;

    try {
      const testData = { ...formData, [field]: value };
      const result = metaSchema.safeParse(testData);

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

    // Validar dados com Zod
    const validationResult = metaSchema.safeParse(formData);

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
      const metaData = {
        titulo: validatedData.titulo,
        descricao: validatedData.descricao || null,
        valor_objetivo: parseFloat(validatedData.valor_objetivo),
        data_objetivo: validatedData.data_objetivo,
        casal_id: casal.id,
      };

      if (editingMeta) {
        const { error } = await supabase
          .from('metas')
          .update(metaData)
          .eq('id', editingMeta.id);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Meta atualizada com sucesso!',
        });
      } else {
        const { error } = await supabase.from('metas').insert([metaData]);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Meta criada com sucesso!',
        });
      }

      setDialogOpen(false);
      setEditingMeta(null);
      setFormData({
        titulo: '',
        descricao: '',
        valor_objetivo: '',
        data_objetivo: '',
      });
      setFieldErrors({});
      fetchMetas();
    } catch (error) {
      console.error('Error saving meta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a meta.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta);
    setFormData({
      titulo: meta.titulo,
      descricao: meta.descricao || '',
      valor_objetivo: meta.valor_objetivo.toString(),
      data_objetivo: meta.data_objetivo,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (meta: Meta) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      const { error } = await supabase.from('metas').delete().eq('id', meta.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Meta excluída com sucesso!',
      });
      fetchMetas();
    } catch (error) {
      console.error('Error deleting meta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a meta.',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'concluida':
        return 'bg-blue-100 text-blue-800';
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgress = (valorAtual: number, valorObjetivo: number) => {
    return Math.min((valorAtual / valorObjetivo) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando metas...</p>
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
            <Target className="h-6 w-6 text-primary" />
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
            <h2 className="text-2xl font-bold">Metas Financeiras</h2>
            <p className="text-muted-foreground">
              Defina e acompanhe suas metas financeiras
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMeta ? 'Editar Meta' : 'Nova Meta'}
                </DialogTitle>
                <DialogDescription>
                  Defina uma nova meta financeira para você e seu parceiro.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Meta</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Viagem para Europa"
                    value={formData.titulo}
                    onChange={(e) =>
                      handleInputChange('titulo', e.target.value)
                    }
                    className={cn(
                      fieldErrors.titulo &&
                        'border-destructive focus:ring-destructive',
                    )}
                  />
                  {fieldErrors.titulo && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.titulo}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (Opcional)</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva sua meta..."
                    value={formData.descricao}
                    onChange={(e) =>
                      handleInputChange('descricao', e.target.value)
                    }
                    className={cn(
                      fieldErrors.descricao &&
                        'border-destructive focus:ring-destructive',
                    )}
                  />
                  {fieldErrors.descricao && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.descricao}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_objetivo">Valor Objetivo</Label>
                    <Input
                      id="valor_objetivo"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.valor_objetivo}
                      onChange={(e) =>
                        handleInputChange('valor_objetivo', e.target.value)
                      }
                      className={cn(
                        fieldErrors.valor_objetivo &&
                          'border-destructive focus:ring-destructive',
                      )}
                    />
                    {fieldErrors.valor_objetivo && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.valor_objetivo}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_objetivo">Data Objetivo</Label>
                    <Input
                      id="data_objetivo"
                      type="date"
                      value={formData.data_objetivo}
                      onChange={(e) =>
                        handleInputChange('data_objetivo', e.target.value)
                      }
                      className={cn(
                        fieldErrors.data_objetivo &&
                          'border-destructive focus:ring-destructive',
                      )}
                    />
                    {fieldErrors.data_objetivo && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.data_objetivo}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingMeta(null);
                      setFormData({
                        titulo: '',
                        descricao: '',
                        valor_objetivo: '',
                        data_objetivo: '',
                      });
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
                      : editingMeta
                      ? 'Atualizar'
                      : 'Criar Meta'}
                  </LoadingButton>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {metas.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhuma meta criada</h2>
            <p className="text-muted-foreground mb-6">
              Comece definindo suas metas financeiras para alcançar seus
              objetivos.
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Suas Metas</h2>
              <p className="text-muted-foreground">
                Acompanhe o progresso de suas metas financeiras
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metas.map((meta) => {
                const progress = getProgress(
                  meta.valor_atual,
                  meta.valor_objetivo,
                );
                const isOverdue =
                  new Date(meta.data_objetivo) < new Date() &&
                  meta.status === 'ativa';

                return (
                  <Card key={meta.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {meta.titulo}
                          </CardTitle>
                          <Badge className={getStatusColor(meta.status)}>
                            {meta.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(meta)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(meta)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {meta.descricao && (
                        <CardDescription>{meta.descricao}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatCurrency(meta.valor_atual)}</span>
                          <span>{formatCurrency(meta.valor_objetivo)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className={isOverdue ? 'text-red-600' : ''}>
                            {formatDate(meta.data_objetivo)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            Faltam{' '}
                            {formatCurrency(
                              meta.valor_objetivo - meta.valor_atual,
                            )}
                          </span>
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
