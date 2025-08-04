-- Update casais RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their couples" ON public.casais;
DROP POLICY IF EXISTS "Users can create couples" ON public.casais;
DROP POLICY IF EXISTS "Users can update their couples" ON public.casais;

-- Create improved policies
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their couples and pending invites" ON public.casais;

-- Create separate policies for better control
CREATE POLICY "Users can view their own couples" ON public.casais
  FOR SELECT USING (
    auth.uid() IN (user1_id, user2_id)
  );

CREATE POLICY "Users can view pending invites" ON public.casais
  FOR SELECT USING (
    status = 'pendente' 
    AND user2_id IS NULL 
    AND codigo_convite IS NOT NULL
  );

CREATE POLICY "Users can create new couples" ON public.casais
  FOR INSERT WITH CHECK (
    auth.uid() = user1_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.casais 
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'ativo'
    )
  );

CREATE POLICY "Users can update their own couples" ON public.casais
  FOR UPDATE USING (
    auth.uid() IN (user1_id, COALESCE(user2_id, '00000000-0000-0000-0000-000000000000'))
  );

CREATE POLICY "Users can accept invites" ON public.casais
  FOR UPDATE USING (
    status = 'pendente' 
    AND user2_id IS NULL 
    AND codigo_convite IS NOT NULL
    AND user1_id != auth.uid()
  );

-- Function to set current user id
CREATE OR REPLACE FUNCTION set_current_user_id()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', auth.uid()::text, true);
END;
$$ LANGUAGE plpgsql;

-- Create function to prevent duplicate active couples
CREATE OR REPLACE FUNCTION check_active_couples()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if either user already has an active couple
  IF EXISTS (
    SELECT 1 FROM public.casais
    WHERE status = 'ativo'
    AND (
      user1_id = NEW.user1_id
      OR user1_id = NEW.user2_id
      OR user2_id = NEW.user1_id
      OR user2_id = NEW.user2_id
    )
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Users cannot have multiple active couples';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce couple constraints
DROP TRIGGER IF EXISTS enforce_couple_constraints ON public.casais;
CREATE TRIGGER enforce_couple_constraints
  BEFORE INSERT OR UPDATE ON public.casais
  FOR EACH ROW
  WHEN (NEW.status = 'ativo')
  EXECUTE FUNCTION check_active_couples();

-- Setup default permissions
ALTER TABLE public.casais ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.casais TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create trigger to set current user id before operations
CREATE OR REPLACE FUNCTION trigger_set_current_user_id()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM set_current_user_id();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_current_user_id ON public.casais;
CREATE TRIGGER set_current_user_id
  BEFORE INSERT OR UPDATE ON public.casais
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_current_user_id();
