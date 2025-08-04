-- Add foreign key constraint between transacoes and contas
ALTER TABLE public.transacoes 
ADD CONSTRAINT transacoes_conta_id_fkey 
FOREIGN KEY (conta_id) REFERENCES public.contas(id) ON DELETE CASCADE;