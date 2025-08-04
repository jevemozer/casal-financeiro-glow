import { z } from "zod";

export const accountFormSchema = z.object({
  nome: z.string()
    .min(2, { message: 'O nome deve ter pelo menos 2 caracteres' })
    .max(50, { message: 'O nome deve ter no máximo 50 caracteres' }),
  tipo: z.enum(['corrente', 'poupanca', 'cartao'], {
    required_error: 'Selecione um tipo de conta',
  }),
  banco: z.string()
    .min(2, { message: 'O nome do banco deve ter pelo menos 2 caracteres' })
    .max(50, { message: 'O nome do banco deve ter no máximo 50 caracteres' })
    .nullable()
    .optional(),
  saldo_inicial: z.number()
    .min(0, { message: 'O saldo inicial não pode ser negativo' }),
  cor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
      message: 'Cor inválida' 
    }),
  icone: z.string()
    .min(1, { message: 'Selecione um ícone' }),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;

export const transferFormSchema = z.object({
  conta_origem_id: z.string().uuid(),
  conta_destino_id: z.string().uuid(),
  valor: z.number()
    .positive({ message: 'O valor deve ser positivo' }),
  descricao: z.string()
    .min(3, { message: 'A descrição deve ter pelo menos 3 caracteres' }),
});

export type TransferFormData = z.infer<typeof transferFormSchema>;

export interface Conta {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'corrente' | 'poupanca' | 'cartao';
  banco: string;
  saldo_inicial: number;
  saldo_atual: number;
  cor: string;
  icone: string;
  created_at: string;
  updated_at: string;
}
