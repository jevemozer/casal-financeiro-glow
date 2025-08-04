import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Spinner básico
const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
      },
      color: {
        default: 'text-primary',
        muted: 'text-muted-foreground',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
    },
  },
);

export interface LoadingSpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, color, text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-2', className)}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, color: color as "default" | "muted" | "white" }))} />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  },
);
LoadingSpinner.displayName = 'LoadingSpinner';

// Loading para cards
const cardLoadingVariants = cva('animate-pulse rounded-lg bg-muted', {
  variants: {
    size: {
      sm: 'h-20',
      md: 'h-32',
      lg: 'h-48',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface LoadingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardLoadingVariants> {
  lines?: number;
}

const LoadingCard = React.forwardRef<HTMLDivElement, LoadingCardProps>(
  ({ className, size, lines = 3, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border bg-card p-6 shadow-sm', className)}
        {...props}
      >
        <div className={cn(cardLoadingVariants({ size }), 'mb-4')} />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse rounded bg-muted',
                i === 0 ? 'h-4 w-3/4' : 'h-3 w-1/2',
              )}
            />
          ))}
        </div>
      </div>
    );
  },
);
LoadingCard.displayName = 'LoadingCard';

// Loading para tabelas
const tableRowVariants = cva('animate-pulse bg-muted', {
  variants: {
    size: {
      sm: 'h-8',
      md: 'h-12',
      lg: 'h-16',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface LoadingTableProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableRowVariants> {
  rows?: number;
  columns?: number;
}

const LoadingTable = React.forwardRef<HTMLDivElement, LoadingTableProps>(
  ({ className, size, rows = 5, columns = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border bg-card', className)}
        {...props}
      >
        {/* Header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'animate-pulse rounded bg-muted',
                  'h-4',
                  i === 0 ? 'w-24' : 'w-16',
                )}
              />
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4">
              <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={cn(
                      tableRowVariants({ size }),
                      'rounded',
                      colIndex === 0 ? 'w-32' : 'w-20',
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
LoadingTable.displayName = 'LoadingTable';

// Botão com loading
export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    { className, loading = false, loadingText, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'h-10 px-4 py-2',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {loading ? loadingText || children : children}
      </button>
    );
  },
);
LoadingButton.displayName = 'LoadingButton';

// Loading de página inteira
export interface PageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ className, text = 'Carregando...', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-screen items-center justify-center',
          className,
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-primary border-t-transparent',
              {
                'h-8 w-8': size === 'sm',
                'h-12 w-12': size === 'md',
                'h-16 w-16': size === 'lg',
              },
            )}
          />
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  },
);
PageLoading.displayName = 'PageLoading';

export {
  LoadingSpinner,
  LoadingCard,
  LoadingTable,
  LoadingButton,
  PageLoading,
};
