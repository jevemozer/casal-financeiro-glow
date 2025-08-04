import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryData {
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
  crescimentoMensal: number;
}

interface ReportsSummaryCardsProps {
  data: SummaryData;
  loading: boolean;
}

export function ReportsSummaryCards({ data, loading }: ReportsSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const summaryCards = [
    {
      title: 'Receitas',
      value: data.totalReceitas,
      description: 'Total no período selecionado',
      icon: TrendingUp,
      trend: 'positive',
    },
    {
      title: 'Despesas',
      value: data.totalDespesas,
      description: 'Total no período selecionado',
      icon: TrendingDown,
      trend: 'negative',
    },
    {
      title: 'Saldo',
      value: data.saldoAtual,
      description: 'Receitas - Despesas',
      icon: DollarSign,
      trend: data.saldoAtual >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Crescimento Mensal',
      value: data.crescimentoMensal,
      description: 'Em relação ao mês anterior',
      icon: Target,
      trend: data.crescimentoMensal >= 0 ? 'positive' : 'negative',
      isPercentage: true,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon 
                className={`h-4 w-4 ${
                  card.trend === 'positive' 
                    ? 'text-emerald-600' 
                    : 'text-red-600'
                }`} 
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-7 w-[120px] mb-1" />
                  <Skeleton className="h-3 w-[150px]" />
                </>
              ) : (
                <>
                  <div 
                    className={`text-2xl font-bold ${
                      card.trend === 'positive' 
                        ? 'text-emerald-700' 
                        : card.trend === 'negative' && card.title !== 'Despesas'
                        ? 'text-red-700'
                        : 'text-foreground'
                    }`}
                  >
                    {card.isPercentage 
                      ? `${card.value.toFixed(1)}%`
                      : formatCurrency(card.value)
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </>
              )}
            </CardContent>
            
            {/* Background gradient */}
            <div 
              className={`absolute inset-0 opacity-5 ${
                card.trend === 'positive' 
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                  : 'bg-gradient-to-br from-red-400 to-red-600'
              }`} 
            />
          </Card>
        );
      })}
    </div>
  );
}