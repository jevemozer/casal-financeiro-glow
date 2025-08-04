create table if not exists public.contas (
  id uuid default uuid_generate_v4() primary key,
  casal_id uuid references public.casais(id) on delete cascade not null,
  nome text not null,
  tipo text not null,
  banco text,
  saldo_inicial numeric(15,2) not null default 0,
  cor text not null,
  icone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint contas_tipo_check check (tipo in ('corrente', 'poupanca', 'cartao')),
  constraint contas_cor_check check (cor ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
);

-- Função para realizar transferências entre contas
create or replace function public.realizar_transferencia(
  p_conta_origem_id uuid,
  p_conta_destino_id uuid,
  p_valor numeric,
  p_descricao text,
  p_casal_id uuid
) returns void language plpgsql security definer as $$
declare
  v_saldo_origem numeric;
begin
  -- Verificar se as contas pertencem ao casal
  if not exists (
    select 1 from contas 
    where id in (p_conta_origem_id, p_conta_destino_id) 
    and casal_id = p_casal_id
  ) then
    raise exception 'Contas inválidas';
  end if;

  -- Verificar saldo suficiente
  select coalesce(
    saldo_inicial + (
      select sum(
        case when tipo = 'receita' then valor else -valor end
      ) from transacoes where conta_id = p_conta_origem_id
    ), 
    saldo_inicial
  ) into v_saldo_origem
  from contas where id = p_conta_origem_id;

  if v_saldo_origem < p_valor then
    raise exception 'Saldo insuficiente';
  end if;

  -- Criar transação de débito na conta de origem
  insert into transacoes (
    conta_id,
    tipo,
    valor,
    descricao,
    casal_id,
    data_transacao
  ) values (
    p_conta_origem_id,
    'despesa',
    p_valor,
    p_descricao || ' (Transferência)',
    p_casal_id,
    now()
  );

  -- Criar transação de crédito na conta de destino
  insert into transacoes (
    conta_id,
    tipo,
    valor,
    descricao,
    casal_id,
    data_transacao
  ) values (
    p_conta_destino_id,
    'receita',
    p_valor,
    p_descricao || ' (Transferência)',
    p_casal_id,
    now()
  );
end; $$;

-- Trigger para atualizar updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end; $$;

create trigger contas_set_updated_at
before update on public.contas
for each row execute function public.set_updated_at();
