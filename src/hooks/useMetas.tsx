import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCasal } from './useCasal';

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

export function useMetas() {
  const { casal } = useCasal();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetas = async () => {
    if (!casal?.id) {
      setLoading(false);
      return;
    }

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, [casal?.id]);

  const metasAtivas = metas.filter(meta => meta.status === 'ativa').length;

  return {
    metas,
    loading,
    metasAtivas,
    refetch: fetchMetas
  };
}