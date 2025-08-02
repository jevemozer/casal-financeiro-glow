-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create casais table
CREATE TABLE public.casais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'inativo')),
  codigo_convite TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create categorias table
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  icone TEXT DEFAULT 'DollarSign',
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contas table
CREATE TABLE public.contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('conta_corrente', 'poupanca', 'cartao_credito', 'investimento')),
  saldo DECIMAL(12,2) NOT NULL DEFAULT 0,
  limite_credito DECIMAL(12,2),
  banco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transacoes table
CREATE TABLE public.transacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
  recorrente BOOLEAN DEFAULT false,
  frequencia_recorrencia TEXT CHECK (frequencia_recorrencia IN ('semanal', 'mensal', 'anual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orcamentos table
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  valor_limite DECIMAL(12,2) NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(casal_id, categoria_id, mes, ano)
);

-- Create metas table
CREATE TABLE public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casal_id UUID NOT NULL REFERENCES public.casais(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_objetivo DECIMAL(12,2) NOT NULL,
  valor_atual DECIMAL(12,2) NOT NULL DEFAULT 0,
  data_objetivo DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for casais
CREATE POLICY "Users can view their couples" ON public.casais
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create couples" ON public.casais
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their couples" ON public.casais
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create RLS policies for categorias
CREATE POLICY "Couple members can view categories" ON public.categorias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can manage categories" ON public.categorias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for contas
CREATE POLICY "Couple members can view accounts" ON public.contas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can manage accounts" ON public.contas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for transacoes
CREATE POLICY "Couple members can view transactions" ON public.transacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can manage transactions" ON public.transacoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for orcamentos
CREATE POLICY "Couple members can view budgets" ON public.orcamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can manage budgets" ON public.orcamentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for metas
CREATE POLICY "Couple members can view goals" ON public.metas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can manage goals" ON public.metas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.casais 
      WHERE id = casal_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_casais_updated_at
  BEFORE UPDATE ON public.casais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_updated_at
  BEFORE UPDATE ON public.contas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transacoes_updated_at
  BEFORE UPDATE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
  BEFORE UPDATE ON public.metas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categorias (casal_id, nome, cor, icone, tipo) 
SELECT 
  c.id,
  categoria.nome,
  categoria.cor,
  categoria.icone,
  categoria.tipo
FROM public.casais c
CROSS JOIN (VALUES
  ('Alimentação', '#ef4444', 'Utensils', 'despesa'),
  ('Transporte', '#3b82f6', 'Car', 'despesa'),
  ('Moradia', '#8b5cf6', 'Home', 'despesa'),
  ('Saúde', '#10b981', 'Heart', 'despesa'),
  ('Lazer', '#f59e0b', 'Gamepad2', 'despesa'),
  ('Educação', '#06b6d4', 'GraduationCap', 'despesa'),
  ('Salário', '#22c55e', 'DollarSign', 'receita'),
  ('Freelance', '#84cc16', 'Briefcase', 'receita'),
  ('Investimentos', '#6366f1', 'TrendingUp', 'receita')
) AS categoria(nome, cor, icone, tipo);