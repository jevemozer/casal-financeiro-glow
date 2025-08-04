import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCasal } from './useCasal';
import { useToast } from './use-toast';
import { AccountFormData, Conta, TransferFormData } from '@/lib/validations/contas';

export function useContas() {
  const { casal } = useCasal();
  const { toast } = useToast();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransfer, setLoadingTransfer] = useState(false);

  const fetchContas = async () => {
    if (!casal?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contas')
        .select(`
          *,
          transacoes (
            id,
            tipo,
            valor,
            data_transacao
          )
        `)
        .eq('casal_id', casal.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calcular saldo atual baseado nas transações
      const contasComSaldo = (data || []).map(conta => {
        const saldoTransacoes = conta.transacoes?.reduce((acc: number, trans: { tipo: string; valor: number | string }) => {
          return acc + (trans.tipo === 'receita' ? Number(trans.valor) : -Number(trans.valor));
        }, 0) || 0;
        
        return {
          ...conta,
          tipo: conta.tipo as 'corrente' | 'poupanca' | 'cartao',
          saldo_atual: Number((conta as any).saldo_inicial || conta.saldo || 0) + saldoTransacoes
        } as Conta;
      });

      setContas(contasComSaldo);
    } catch (error) {
      console.error('Error fetching contas:', error);
      toast({
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar suas contas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContas();
  }, [casal?.id]);

  // Criar nova conta
  const createConta = async (data: AccountFormData) => {
    if (!casal?.id) return;
    setLoading(true);
    
    try {
      const newConta = {
        nome: data.nome,
        tipo: data.tipo,
        banco: data.banco || null,
        casal_id: casal.id,
        saldo_inicial: data.saldo_inicial || 0,
        cor: data.cor,
        icone: data.icone
      };
      
      console.log('Tentando criar conta:', newConta);
      
      const { error, data: responseData } = await supabase
        .from('contas')
        .insert(newConta)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Resposta do Supabase:', responseData);

      toast({
        title: "Conta criada",
        description: "Sua conta foi criada com sucesso!",
      });

      await fetchContas();
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar conta existente
  const updateConta = async (id: string, data: Partial<AccountFormData>) => {
    if (!casal?.id) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contas')
        .update(data)
        .eq('id', id)
        .eq('casal_id', casal.id);

      if (error) throw error;

      toast({
        title: "Conta atualizada",
        description: "Sua conta foi atualizada com sucesso!",
      });

      await fetchContas();
    } catch (error) {
      toast({
        title: "Erro ao atualizar conta",
        description: "Não foi possível atualizar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Deletar conta
  const deleteConta = async (id: string) => {
    if (!casal?.id) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contas')
        .delete()
        .eq('id', id)
        .eq('casal_id', casal.id);

      if (error) throw error;

      toast({
        title: "Conta removida",
        description: "Sua conta foi removida com sucesso!",
      });

      await fetchContas();
    } catch (error) {
      toast({
        title: "Erro ao remover conta",
        description: "Não foi possível remover a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Realizar transferência entre contas
  const transferirEntreContas = async (data: TransferFormData) => {
    if (!casal?.id) return;
    setLoadingTransfer(true);
    
    try {
      // Verificar se há saldo suficiente
      const contaOrigem = contas.find(c => c.id === data.conta_origem_id);
      if (!contaOrigem || (contaOrigem.saldo_atual || 0) < data.valor) {
        throw new Error('Saldo insuficiente para realizar a transferência');
      }

      const { error } = await supabase.rpc('realizar_transferencia', {
        p_conta_origem_id: data.conta_origem_id,
        p_conta_destino_id: data.conta_destino_id,
        p_valor: data.valor,
        p_descricao: data.descricao,
        p_casal_id: casal.id
      });

      if (error) throw error;

      toast({
        title: "Transferência realizada",
        description: "Sua transferência foi realizada com sucesso!",
      });

      await fetchContas();
    } catch (error) {
      toast({
        title: "Erro na transferência",
        description: error.message || "Não foi possível realizar a transferência. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingTransfer(false);
    }
  };

  const saldoTotal = contas.reduce((total, conta) => total + (conta.saldo_atual || 0), 0);

  return {
    contas,
    loading,
    loadingTransfer,
    saldoTotal,
    createConta,
    updateConta,
    deleteConta,
    transferirEntreContas,
    refetch: fetchContas
  };
}