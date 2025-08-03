import { z } from 'zod';

export const metaSchema = z.object({
  titulo: z.string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  valor_objetivo: z.string()
    .min(1, 'Valor objetivo é obrigatório')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Valor objetivo deve ser um número positivo'),
  
  data_objetivo: z.string()
    .min(1, 'Data objetivo é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(date.getTime()) && date >= today;
    }, 'Data objetivo deve ser uma data válida no futuro')
});

export type MetaFormData = z.infer<typeof metaSchema>;

export const metaUpdateSchema = metaSchema.partial();

export type MetaUpdateData = z.infer<typeof metaUpdateSchema>; 