import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  CreditCard,
  Wallet,
  ArrowLeft,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { contaSchema, type ContaFormData } from '@/lib/validations/conta';

interface Conta {
  id: string;
  nome: string;
  tipo: string;
  banco?: string;
  saldo: number;
  limite_credito?: number;
}

export default function Contas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    banco: '',
    saldo: '0',
    limite_credito: '',
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchContas();
  }, []);

  const fetchContas = async () => {
    try {
      // First get the casal_id from the casais table
      const { data: casalData, error: casalError } = await supabase
        .from('casais')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (casalError || !casalData) {
        setContas([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('contas')
        .select('*')
        .eq('casal_id', casalData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as contas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar dados com Zod
    const validationResult = contaSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      const firstError = errors[0];
      toast({
        title: 'Erro de Validação',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get casal_id
      const { data: casalData, error: casalError } = await supabase
        .from('casais')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (casalError || !casalData) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar conectado a um parceiro primeiro.',
          variant: 'destructive',
        });
        return;
      }

      const validatedData = validationResult.data;
      const contaData = {
        nome: validatedData.nome,
        tipo: validatedData.tipo,
        banco: validatedData.banco || null,
        saldo: parseFloat(validatedData.saldo) || 0,
        limite_credito: validatedData.limite_credito
          ? parseFloat(validatedData.limite_credito)
          : null,
        casal_id: casalData.id,
      };

      if (editingConta) {
        const { error } = await supabase
          .from('contas')
          .update(contaData)
          .eq('id', editingConta.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Conta atualizada com sucesso!',
        });
      } else {
        const { error } = await supabase.from('contas').insert([contaData]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Conta adicionada com sucesso!',
        });
      }

      setFormData({
        nome: '',
        tipo: '',
        banco: '',
        saldo: '0',
        limite_credito: '',
      });
      setEditingConta(null);
      setIsDialogOpen(false);
      fetchContas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a conta.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (conta: Conta) => {
    setEditingConta(conta);
    setFormData({
      nome: conta.nome,
      tipo: conta.tipo,
      banco: conta.banco || '',
      saldo: conta.saldo.toString(),
      limite_credito: conta.limite_credito?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
      const { error } = await supabase.from('contas').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Conta excluída com sucesso!',
      });

      fetchContas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a conta.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: '',
      banco: '',
      saldo: '0',
      limite_credito: '',
    });
    setEditingConta(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Contas</h1>
            <p className="text-muted-foreground">
              Gerencie suas contas bancárias e cartões
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            {contas.length} conta{contas.length !== 1 ? 's' : ''} cadastrada
            {contas.length !== 1 ? 's' : ''}
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingConta ? 'Editar Conta' : 'Nova Conta'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Conta</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nome: e.target.value }))
                    }
                    placeholder="Ex: Conta Corrente Nubank"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, tipo: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Poupança</SelectItem>
                      <SelectItem value="credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="investimento">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    value={formData.banco}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        banco: e.target.value,
                      }))
                    }
                    placeholder="Ex: Nubank, Itaú, Bradesco..."
                  />
                </div>

                <div>
                  <Label htmlFor="saldo">Saldo Atual</Label>
                  <Input
                    id="saldo"
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        saldo: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>

                {formData.tipo === 'credito' && (
                  <div>
                    <Label htmlFor="limite_credito">Limite de Crédito</Label>
                    <Input
                      id="limite_credito"
                      type="number"
                      step="0.01"
                      value={formData.limite_credito}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          limite_credito: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingConta ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Carregando contas...</div>
        ) : contas.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent className="pt-6">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma conta cadastrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione sua primeira conta para começar a gerenciar suas
                finanças
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contas.map((conta) => (
              <Card key={conta.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {conta.tipo === 'credito' ? (
                        <CreditCard className="h-5 w-5" />
                      ) : (
                        <Wallet className="h-5 w-5" />
                      )}
                      <CardTitle className="text-lg">{conta.nome}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(conta)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(conta.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="capitalize">
                    {conta.tipo.replace('_', ' ')}{' '}
                    {conta.banco && `• ${conta.banco}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {conta.tipo === 'credito' ? 'Fatura Atual' : 'Saldo'}
                      </span>
                      <span
                        className={`font-semibold ${
                          conta.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(conta.saldo)}
                      </span>
                    </div>

                    {conta.tipo === 'credito' && conta.limite_credito && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Limite
                        </span>
                        <span className="text-sm">
                          {formatCurrency(conta.limite_credito)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
