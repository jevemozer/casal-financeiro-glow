import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Casal {
  id: string;
  user1_id: string;
  user2_id: string | null;
  status: string;
  codigo_convite: string | null;
  created_at: string;
  updated_at: string;
}

export function useCasal() {
  const { user } = useAuth();
  const [casal, setCasal] = useState<Casal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCasal = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('casais')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCasal(data);
    } catch (error) {
      console.error('Error fetching casal:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasal();
  }, [user]);

  return {
    casal,
    loading,
    refetch: fetchCasal
  };
}