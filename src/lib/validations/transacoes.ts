import { z } from 'zod';

export const TransactionType = z.enum(['receita', 'despesa', 'poupança']);
export type TransactionType = z.infer<typeof TransactionType>;

export const FrequencyType = z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']);
export type FrequencyType = z.infer<typeof FrequencyType>;

export const createTransactionSchema = z.object({
  descricao: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  tipo: TransactionType,
  data_transacao: z.date(),
  conta_id: z.string().uuid('ID da conta inválido'),
  categoria_id: z.string().uuid('ID da categoria inválido'),
  observacao: z.string().optional(),
  comprovante_url: z.string().url().optional(),
  is_recorrente: z.boolean().default(false),
  frequencia: FrequencyType.optional(),
  proxima_data: z.date().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionFiltersSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  tipo: TransactionType.optional(),
  conta_id: z.string().uuid('ID da conta inválido').optional(),
  categoria_id: z.string().uuid('ID da categoria inválido').optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  sortBy: z.enum(['data_transacao', 'valor', 'descricao']).default('data_transacao'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
