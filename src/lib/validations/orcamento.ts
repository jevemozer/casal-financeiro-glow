import { z } from 'zod';

export const orcamentoSchema = z.object({
  categoria_id: z.string()
    .min(1, 'Categoria é obrigatória'),
  
  valor_limite: z.string()
    .min(1, 'Valor limite é obrigatório')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Valor limite deve ser um número positivo'),
  
  mes: z.number()
    .min(1, 'Mês deve ser entre 1 e 12')
    .max(12, 'Mês deve ser entre 1 e 12'),
  
  ano: z.number()
    .min(2020, 'Ano deve ser válido')
    .max(2030, 'Ano deve ser válido')
});

export type OrcamentoFormData = z.infer<typeof orcamentoSchema>;

export const orcamentoUpdateSchema = orcamentoSchema.partial();

export type OrcamentoUpdateData = z.infer<typeof orcamentoUpdateSchema>; 