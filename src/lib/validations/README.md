# Sistema de Validação com Zod

Este diretório contém todos os schemas de validação do projeto CasalFinance usando Zod.

## Estrutura

```
src/lib/validations/
├── index.ts          # Exportações centralizadas
├── transacao.ts      # Validação para transações
├── conta.ts          # Validação para contas
├── meta.ts           # Validação para metas
├── orcamento.ts      # Validação para orçamentos
└── README.md         # Esta documentação
```

## Schemas Disponíveis

### Transação (`transacao.ts`)
- **descricao**: String obrigatória (1-100 caracteres)
- **valor**: String que deve ser um número positivo
- **tipo**: Enum ('receita' | 'despesa')
- **data_transacao**: Data válida
- **categoria_id**: String obrigatória
- **conta_id**: String obrigatória
- **recorrente**: Boolean (opcional)
- **frequencia_recorrencia**: String opcional ('semanal' | 'mensal' | 'anual')

### Conta (`conta.ts`)
- **nome**: String obrigatória (1-50 caracteres)
- **tipo**: Enum ('conta_corrente' | 'poupanca' | 'cartao_credito' | 'investimento')
- **saldo**: String que deve ser um número válido
- **limite_credito**: String opcional (número positivo)
- **banco**: String opcional (máx 50 caracteres)

### Meta (`meta.ts`)
- **titulo**: String obrigatória (1-100 caracteres)
- **descricao**: String opcional (máx 500 caracteres)
- **valor_objetivo**: String que deve ser um número positivo
- **data_objetivo**: Data válida no futuro

### Orçamento (`orcamento.ts`)
- **categoria_id**: String obrigatória
- **valor_limite**: String que deve ser um número positivo
- **mes**: Número entre 1-12
- **ano**: Número entre 2020-2030

## Como Usar

### 1. Validação Manual

```typescript
import { transacaoSchema } from '@/lib/validations/transacao';

const handleSubmit = async (formData: any) => {
  const validationResult = transacaoSchema.safeParse(formData);
  
  if (!validationResult.success) {
    const errors = validationResult.error.errors;
    const firstError = errors[0];
    console.error(firstError.message);
    return;
  }

  const validatedData = validationResult.data;
  // Usar validatedData para salvar no banco
};
```

### 2. Com React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transacaoSchema } from '@/lib/validations/transacao';

const form = useForm({
  resolver: zodResolver(transacaoSchema),
  defaultValues: {
    descricao: '',
    valor: '',
    tipo: 'despesa',
    // ...
  }
});
```

### 3. Tipos TypeScript

```typescript
import { TransacaoFormData } from '@/lib/validations/transacao';

const handleSubmit = (data: TransacaoFormData) => {
  // data já está tipado corretamente
};
```

## Benefícios

1. **Validação Centralizada**: Todos os schemas em um local
2. **Type Safety**: Tipos TypeScript gerados automaticamente
3. **Mensagens de Erro**: Mensagens em português
4. **Reutilização**: Schemas podem ser usados em diferentes partes
5. **Consistência**: Validação uniforme em todo o projeto

## Exemplo de Uso Completo

Veja o componente `ValidatedForm.tsx` para um exemplo completo de implementação com React Hook Form. 