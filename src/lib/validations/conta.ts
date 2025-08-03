import { z } from 'zod';

export const contaSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  
  tipo: z.enum(['conta_corrente', 'poupanca', 'cartao_credito', 'investimento'], {
    required_error: 'Tipo é obrigatório',
    invalid_type_error: 'Tipo deve ser conta_corrente, poupanca, cartao_credito ou investimento'
  }),
  
  saldo: z.string()
    .min(1, 'Saldo é obrigatório')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num);
    }, 'Saldo deve ser um número válido'),
  
  limite_credito: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Limite de crédito deve ser um número positivo'),
  
  banco: z.string()
    .max(50, 'Nome do banco deve ter no máximo 50 caracteres')
    .optional()
});

export type ContaFormData = z.infer<typeof contaSchema>;

export const contaUpdateSchema = contaSchema.partial();

export type ContaUpdateData = z.infer<typeof contaUpdateSchema>; 