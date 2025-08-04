-- Enable RLS on contas table
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their couples accounts" ON public.contas;
DROP POLICY IF EXISTS "Users can create accounts for their couple" ON public.contas;
DROP POLICY IF EXISTS "Users can update their couples accounts" ON public.contas;
DROP POLICY IF EXISTS "Users can delete their couples accounts" ON public.contas;

-- Create policies for contas table
CREATE POLICY "Users can view their couples accounts" ON public.contas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.casais
      WHERE id = casal_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create accounts for their couple" ON public.contas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.casais
      WHERE id = casal_id
      AND status = 'ativo'
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their couples accounts" ON public.contas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.casais
      WHERE id = casal_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their couples accounts" ON public.contas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.casais
      WHERE id = casal_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Grant permissions
GRANT ALL ON public.contas TO authenticated;
