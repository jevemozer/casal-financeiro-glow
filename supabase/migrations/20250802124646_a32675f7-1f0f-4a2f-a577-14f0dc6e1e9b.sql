-- Create function to populate default categories for a couple
CREATE OR REPLACE FUNCTION public.create_default_categories(casal_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default expense categories
  INSERT INTO public.categorias (casal_id, nome, tipo, icone, cor) VALUES
  (casal_uuid, 'Alimentação', 'despesa', 'Utensils', '#ef4444'),
  (casal_uuid, 'Transporte', 'despesa', 'Car', '#f97316'),
  (casal_uuid, 'Moradia', 'despesa', 'Home', '#eab308'),
  (casal_uuid, 'Saúde', 'despesa', 'Heart', '#22c55e'),
  (casal_uuid, 'Educação', 'despesa', 'GraduationCap', '#3b82f6'),
  (casal_uuid, 'Lazer', 'despesa', 'Gamepad2', '#8b5cf6'),
  (casal_uuid, 'Roupas', 'despesa', 'Shirt', '#ec4899'),
  (casal_uuid, 'Outros', 'despesa', 'Package', '#6b7280');

  -- Insert default income categories
  INSERT INTO public.categorias (casal_id, nome, tipo, icone, cor) VALUES
  (casal_uuid, 'Salário', 'receita', 'Banknote', '#22c55e'),
  (casal_uuid, 'Freelance', 'receita', 'Laptop', '#10b981'),
  (casal_uuid, 'Investimentos', 'receita', 'TrendingUp', '#059669'),
  (casal_uuid, 'Outros', 'receita', 'Plus', '#16a34a');
END;
$$;

-- Create trigger to automatically create default categories when a couple becomes active
CREATE OR REPLACE FUNCTION public.handle_couple_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create categories when status changes to 'ativo'
  IF NEW.status = 'ativo' AND OLD.status != 'ativo' THEN
    PERFORM public.create_default_categories(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_couple_activation ON public.casais;
CREATE TRIGGER trigger_couple_activation
  AFTER UPDATE ON public.casais
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_couple_activation();