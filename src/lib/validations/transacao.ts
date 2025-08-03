import { z } from 'zod';

export const transacaoSchema = z.object({
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  
  valor: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Valor deve ser um número positivo'),
  
  tipo: z.enum(['receita', 'despesa'], {
    required_error: 'Tipo é obrigatório',
    invalid_type_error: 'Tipo deve ser receita ou despesa'
  }),
  
  data_transacao: z.string()
    .min(1, 'Data é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Data inválida'),
  
  categoria_id: z.string()
    .min(1, 'Categoria é obrigatória'),
  
  conta_id: z.string()
    .min(1, 'Conta é obrigatória'),
  
  recorrente: z.boolean().default(false),
  
  frequencia_recorrencia: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return ['semanal', 'mensal', 'anual'].includes(val);
    }, 'Frequência deve ser semanal, mensal ou anual')
});

export type TransacaoFormData = z.infer<typeof transacaoSchema>;

export const transacaoUpdateSchema = transacaoSchema.partial();

export type TransacaoUpdateData = z.infer<typeof transacaoUpdateSchema>; 