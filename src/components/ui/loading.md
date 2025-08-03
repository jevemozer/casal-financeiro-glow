# Sistema de Loading Uniforme

Este arquivo contém componentes de loading reutilizáveis que seguem o padrão visual do projeto.

## Componentes Disponíveis

### LoadingSpinner
Spinner básico com animação de rotação.

```tsx
import { LoadingSpinner } from "@/components/ui/loading"

// Uso básico
<LoadingSpinner />

// Com customizações
<LoadingSpinner 
  size="lg" 
  color="white" 
  text="Carregando dados..." 
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" (padrão: "md")
- `color`: "default" | "muted" | "white" (padrão: "default")
- `text`: string (opcional) - texto ao lado do spinner

### LoadingCard
Card com skeleton loading para conteúdo de cards.

```tsx
import { LoadingCard } from "@/components/ui/loading"

// Uso básico
<LoadingCard />

// Com customizações
<LoadingCard 
  size="lg" 
  lines={5} 
  className="w-full"
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" (padrão: "md")
- `lines`: number (padrão: 3) - número de linhas de texto skeleton

### LoadingTable
Tabela com skeleton loading para dados tabulares.

```tsx
import { LoadingTable } from "@/components/ui/loading"

// Uso básico
<LoadingTable />

// Com customizações
<LoadingTable 
  rows={10} 
  columns={6} 
  size="lg"
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" (padrão: "md")
- `rows`: number (padrão: 5) - número de linhas
- `columns`: number (padrão: 4) - número de colunas

### LoadingButton
Botão com estado de loading integrado.

```tsx
import { LoadingButton } from "@/components/ui/loading"

// Uso básico
<LoadingButton loading={isLoading}>
  Salvar
</LoadingButton>

// Com texto de loading customizado
<LoadingButton 
  loading={isLoading} 
  loadingText="Salvando..."
>
  Salvar
</LoadingButton>
```

**Props:**
- `loading`: boolean - estado de loading
- `loadingText`: string (opcional) - texto durante loading
- `children`: ReactNode - conteúdo do botão

### PageLoading
Loading de página inteira, ideal para carregamentos iniciais.

```tsx
import { PageLoading } from "@/components/ui/loading"

// Uso básico
<PageLoading />

// Com customizações
<PageLoading 
  text="Inicializando aplicação..." 
  size="lg"
/>
```

**Props:**
- `text`: string (padrão: "Carregando...") - texto de loading
- `size`: "sm" | "md" | "lg" (padrão: "md")

## Integração com Estados de Loading

### Exemplo com React Query
```tsx
import { useQuery } from "@tanstack/react-query"
import { LoadingSpinner, LoadingTable } from "@/components/ui/loading"

function TransacoesPage() {
  const { data: transacoes, isLoading, error } = useQuery({
    queryKey: ['transacoes'],
    queryFn: fetchTransacoes
  })

  if (isLoading) {
    return <LoadingTable rows={8} columns={5} />
  }

  if (error) {
    return <div>Erro ao carregar transações</div>
  }

  return (
    <div>
      {/* Renderizar dados */}
    </div>
  )
}
```

### Exemplo com Formulários
```tsx
import { LoadingButton } from "@/components/ui/loading"
import { useState } from "react"

function TransacaoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await submitTransacao(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      <LoadingButton 
        type="submit" 
        loading={isSubmitting}
        loadingText="Salvando transação..."
      >
        Salvar Transação
      </LoadingButton>
    </form>
  )
}
```

## Padrões de Uso

1. **Loading de Dados**: Use `LoadingTable` para listas e `LoadingCard` para cards
2. **Loading de Formulários**: Use `LoadingButton` para botões de submit
3. **Loading de Página**: Use `PageLoading` para carregamentos iniciais
4. **Loading de Componentes**: Use `LoadingSpinner` para loading simples

## Cores e Tamanhos

Todos os componentes seguem o sistema de design do projeto:
- **Cores**: primary, muted, white
- **Tamanhos**: sm, md, lg
- **Animações**: animate-spin, animate-pulse
- **Espaçamentos**: gap-2, gap-4, etc. 