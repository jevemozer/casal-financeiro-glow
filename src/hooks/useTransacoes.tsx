import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from '@/lib/validations/transacoes';
import { useToast } from '@/hooks/use-toast';
import { useCasal } from './useCasal';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'poupança';
  data_transacao: string;
  conta_id: string;
  categoria_id: string;
  observacao?: string;
  comprovante_url?: string;
  recorrente: boolean;
  frequencia_recorrencia?: string;
  created_at: string;
  updated_at: string;
  contas: {
    nome: string;
  } | null;
  categorias: {
    nome: string;
    cor: string;
    icone: string;
  } | null;
}

interface UseTransacoesReturn {
  transacoes: Transacao[];
  loading: boolean;
  gastosMes: number;
  refetch: () => Promise<void>;
}

export function useTransacoes(limit = 10): UseTransacoesReturn {
  const { casal } = useCasal();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransacoes = useCallback(async () => {
    if (!casal?.id) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('transacoes')
        .select(`
          *,
          categorias(nome, icone, cor),
          contas(nome)
        `)
        .eq('casal_id', casal.id)
        .order('data_transacao', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransacoes(data?.map(t => ({
        ...t,
        tipo: t.tipo as 'receita' | 'despesa' | 'poupança'
      })) || []);
    } catch (error) {
      console.error('Error fetching transacoes:', error);
    } finally {
      setLoading(false);
    }
  }, [casal?.id, limit]);

  useEffect(() => {
    fetchTransacoes();
  }, [fetchTransacoes]);

  // Calcular gastos do mês atual
  const gastosMes = transacoes
    .filter(t => {
      const dataTransacao = new Date(t.data_transacao);
      const agora = new Date();
      return t.tipo === 'despesa' && 
             dataTransacao.getMonth() === agora.getMonth() && 
             dataTransacao.getFullYear() === agora.getFullYear();
    })
    .reduce((total, transacao) => total + Number(transacao.valor), 0);

  return {
    transacoes,
    loading,
    gastosMes,
    refetch: fetchTransacoes
  };
}