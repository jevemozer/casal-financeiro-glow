// Definir tipos para as entidades do Supabase
interface Transacao {
  id: string;
  casal_id: string;
  conta_id: string;
  categoria_id: string;
  user_id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data_transacao: string;
  categorias?: {
    nome: string;
    cor: string;
  };
}

interface CategoryData {
  valor: number;
  cor: string;
}

interface CategoryMap {
  [key: string]: CategoryData;
}

export type { Transacao, CategoryData, CategoryMap };
