import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCasal } from '@/hooks/useCasal';
import { useRelatorios } from '@/hooks/useRelatorios';
import { ExpenseChart } from '@/components/charts/ExpenseChart';
import { IncomeChart } from '@/components/charts/IncomeChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Filters, type FilterValues } from '@/components/Filters';
import { 
  ReportsSummaryCards, 
  ReportsHeader,
  ComparisonChart 
} from '@/components/reports';

export default function Relatorios() {
  const { user } = useAuth();
  const { casal } = useCasal();
  const { data, filters, setFilters } = useRelatorios();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!casal?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa ter um parceiro conectado para acessar os relatórios.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleExportPDF = () => {
    // TODO: Implementar exportação para PDF
    console.log('Exportando para PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implementar exportação para Excel
    console.log('Exportando para Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // TODO: Implementar compartilhamento
    console.log('Compartilhando relatório...');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <ReportsHeader
          startDate={filters.startDate ? filters.startDate.toISOString() : undefined}
          endDate={filters.endDate ? filters.endDate.toISOString() : undefined}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onPrint={handlePrint}
          onShare={handleShare}
        />

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <Filters 
              onFilterChange={values => setFilters({ ...filters, ...values })} 
              variant="reports"
              initialValues={{
                startDate: filters.startDate ? new Date(filters.startDate) : null,
                endDate: filters.endDate ? new Date(filters.endDate) : null,
                categories: filters.categories || [],
                type: filters.type || 'all',
                minValue: '',
                maxValue: '',
                accounts: [],
                period: filters.period || 'thisMonth',
              }}
            />
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <ReportsSummaryCards 
          data={data.summary} 
          loading={data.loading} 
        />

        {/* Gráficos */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Despesas por Categoria */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>
                Distribuição dos gastos por categoria no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ExpenseChart data={data.expensesByCategory} />
              )}
            </CardContent>
          </Card>

          {/* Receitas por Fonte */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Receitas por Fonte</CardTitle>
              <CardDescription>
                Distribuição das receitas por fonte no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <IncomeChart data={data.incomeBySource} />
              )}
            </CardContent>
          </Card>

          {/* Tendências */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Tendências Financeiras</CardTitle>
              <CardDescription>
                Evolução de receitas, despesas e saldo ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <TrendChart data={data.trends} />
              )}
            </CardContent>
          </Card>

          {/* Comparação Mensal */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Comparação Mensal</CardTitle>
              <CardDescription>
                Compare receitas, despesas e saldo entre diferentes períodos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ComparisonChart 
                  data={data.trends || []} 
                  showSaldo={true}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
