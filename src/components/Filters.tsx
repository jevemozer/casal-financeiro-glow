import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarIcon,
  SlidersHorizontal,
  X,
  ArrowDownIcon,
  ArrowUpIcon,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type TransactionType = 'receita' | 'despesa' | 'poupança';
type Category = 'alimentação' | 'transporte' | 'lazer' | 'saúde' | 'outros';
type SortField = 'data' | 'valor' | 'categoria';
type SortOrder = 'asc' | 'desc';

interface FilterValues {
  startDate: Date | null;
  endDate: Date | null;
  type: TransactionType | null;
  category: Category | null;
  sortBy: SortField | null;
  sortOrder: SortOrder | null;
}

interface FiltersProps {
  onClose?: () => void;
  onChange?: (filters: FilterValues) => void;
}

const DEFAULT_FILTERS: FilterValues = {
  startDate: null,
  endDate: null,
  type: null,
  category: null,
  sortBy: null,
  sortOrder: null,
};

const TRANSACTION_TYPES: TransactionType[] = ['receita', 'despesa', 'poupança'];
const CATEGORIES: Category[] = ['alimentação', 'transporte', 'lazer', 'saúde', 'outros'];
const SORT_FIELDS: SortField[] = ['data', 'valor', 'categoria'];

export function Filters({ onClose, onChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const handleFilterChange = useCallback(<T extends keyof FilterValues>(
    key: T,
    value: FilterValues[T]
  ) => {
    setFilters((prev) => {
      if (key === 'sortBy') {
        // Toggle sort order if clicking the same field
        if (prev.sortBy === value) {
          return {
            ...prev,
            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
          };
        }
        // Set default sort order for new field
        return {
          ...prev,
          [key]: value,
          sortOrder: 'asc',
        };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  return (
    <div className="bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 rounded-lg p-4 border border-purple-100/50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-5 w-5 text-purple-500" />
          <span className="font-medium text-lg text-gray-700">Filtros</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className={cn(
              "text-xs text-gray-500 hover:text-purple-500",
              "flex items-center space-x-1"
            )}
          >
            <RefreshCw className="h-3 w-3" />
            <span>Limpar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn(
              "text-xs text-gray-500 hover:text-purple-500",
              "flex items-center space-x-1"
            )}
          >
            <X className="h-3 w-3" />
            <span>Fechar</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Date filters */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    "bg-white/50 hover:bg-white transition-colors",
                    "border-purple-100/50 hover:border-purple-200"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                  {filters.startDate ? (
                    <span className="text-sm">
                      {format(filters.startDate, 'PPP', { locale: ptBR })}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Selecione a data
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={(date) => handleFilterChange('startDate', date)}
                  initialFocus
                  locale={ptBR}
                  className="rounded-md border border-purple-100"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    "bg-white/50 hover:bg-white transition-colors",
                    "border-purple-100/50 hover:border-purple-200"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                  {filters.endDate ? (
                    <span className="text-sm">
                      {format(filters.endDate, 'PPP', { locale: ptBR })}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Selecione a data
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => handleFilterChange('endDate', date)}
                  initialFocus
                  locale={ptBR}
                  className="rounded-md border border-purple-100"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Type and Category filters */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Tipo</Label>
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={filters.type === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('type', type)}
                  className={cn(
                    "capitalize",
                    filters.type === type ? 
                      "bg-purple-500 hover:bg-purple-600 text-white" : 
                      "bg-white/50 hover:bg-white border-purple-100/50 hover:border-purple-200"
                  )}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Categoria</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={filters.category === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('category', category)}
                  className={cn(
                    "capitalize",
                    filters.category === category ? 
                      "bg-purple-500 hover:bg-purple-600 text-white" : 
                      "bg-white/50 hover:bg-white border-purple-100/50 hover:border-purple-200"
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sorting options */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Ordenar por</Label>
          <div className="flex flex-wrap gap-2">
            {SORT_FIELDS.map((field) => (
              <Button
                key={field}
                variant={filters.sortBy === field ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('sortBy', field)}
                className={cn(
                  "capitalize",
                  filters.sortBy === field ? 
                    "bg-purple-500 hover:bg-purple-600 text-white" : 
                    "bg-white/50 hover:bg-white border-purple-100/50 hover:border-purple-200"
                )}
              >
                {field}
                {filters.sortBy === field && (
                  filters.sortOrder === 'asc' ? 
                    <ArrowUpIcon className="ml-1 h-3 w-3" /> : 
                    <ArrowDownIcon className="ml-1 h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
