import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCasal } from './useCasal';

interface Conta {
  id: string;
  nome: string;
  tipo: string;
  banco: string | null;
  saldo: number;
  limite_credito: number | null;
  created_at: string;
  updated_at: string;
}

export function useContas() {
  const { casal } = useCasal();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContas = async () => {
    if (!casal?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contas')
        .select('*')
        .eq('casal_id', casal.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Error fetching contas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContas();
  }, [casal?.id]);

  const saldoTotal = contas.reduce((total, conta) => total + Number(conta.saldo), 0);

  return {
    contas,
    loading,
    saldoTotal,
    refetch: fetchContas
  };
}