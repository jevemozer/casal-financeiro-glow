import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCasal } from './useCasal';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  data_transacao: string;
  user_id: string;
  categoria_id: string;
  conta_id: string;
  recorrente: boolean;
  frequencia_recorrencia: string | null;
  created_at: string;
  updated_at: string;
  categorias: {
    nome: string;
    icone: string;
    cor: string;
  } | null;
  contas: {
    nome: string;
  } | null;
}

export function useTransacoes(limit?: number) {
  const { casal } = useCasal();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransacoes = async () => {
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
      setTransacoes(data || []);
    } catch (error) {
      console.error('Error fetching transacoes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacoes();
  }, [casal?.id, limit]);

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