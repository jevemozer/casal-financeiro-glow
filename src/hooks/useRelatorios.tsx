import { useState, useEffect, useCallback } from 'react';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../integrations/supabase/client';
import { useCasal } from './useCasal';
import type { Transacao, CategoryData, CategoryMap } from '../types/relatorios';

interface ReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  period: 'last30' | 'last90' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
  categories?: string[];
  type?: 'all' | 'receita' | 'despesa';
  minValue?: string;
  maxValue?: string;
  accounts?: string[];
}

interface ReportData {
  expensesByCategory: {
    categoria: string;
    valor: number;
    cor: string;
  }[];
  incomeBySource: {
    fonte: string;
    valor: number;
    cor: string;
  }[];
  trends: {
    data: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldoAtual: number;
    crescimentoMensal: number;
  };
  loading: boolean;
}

export function useRelatorios(initialFilters?: Partial<ReportFilters>) {
  const { casal } = useCasal();
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: null,
    endDate: null,
    period: 'thisMonth',
    categories: [],
    type: 'all',
    minValue: '',
    maxValue: '',
    accounts: [],
    ...initialFilters,
  });
  const [data, setData] = useState<ReportData>({
    expensesByCategory: [],
    incomeBySource: [],
    trends: [],
    summary: {
      totalReceitas: 0,
      totalDespesas: 0,
      saldoAtual: 0,
      crescimentoMensal: 0,
    },
    loading: true,
  });

  const processExpensesByCategory = useCallback((transacoes: Transacao[]) => {
    const expenses = transacoes.filter(t => t.tipo === 'despesa');
    const byCategory = expenses.reduce((acc: CategoryMap, t) => {
      const categoria = t.categorias?.nome || 'Sem categoria';
      const cor = t.categorias?.cor || '#cbd5e1';
      if (!acc[categoria]) {
        acc[categoria] = { valor: 0, cor };
      }
      acc[categoria].valor += t.valor;
      return acc;
    }, {});

    return Object.entries(byCategory).map(([categoria, data]) => ({
      categoria,
      valor: data.valor,
      cor: data.cor,
    }));
  }, []);

  const processIncomeBySource = useCallback((transacoes: Transacao[]) => {
    const incomes = transacoes.filter(t => t.tipo === 'receita');
    const bySource = incomes.reduce((acc: CategoryMap, t) => {
      const fonte = t.categorias?.nome || 'Sem categoria';
      const cor = t.categorias?.cor || '#cbd5e1';
      if (!acc[fonte]) {
        acc[fonte] = { valor: 0, cor };
      }
      acc[fonte].valor += t.valor;
      return acc;
    }, {});

    return Object.entries(bySource).map(([fonte, data]) => ({
      fonte,
      valor: data.valor,
      cor: data.cor,
    }));
  }, []);

  const processTrends = useCallback((transacoes: Transacao[], period: string) => {
    const trends: Record<string, { receitas: number; despesas: number }> = {};

    transacoes.forEach(t => {
      const date = new Date(t.data_transacao);
      const key = format(date, period === 'mensal' ? 'MMM/yy' : 'MM/yyyy', { locale: ptBR });
      
      if (!trends[key]) {
        trends[key] = { receitas: 0, despesas: 0 };
      }

      if (t.tipo === 'receita') {
        trends[key].receitas += t.valor;
      } else {
        trends[key].despesas += t.valor;
      }
    });

    return Object.entries(trends)
      .map(([data, valores]) => ({
        data,
        receitas: valores.receitas,
        despesas: valores.despesas,
        saldo: valores.receitas - valores.despesas,
      }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }, []);

  const calculateSummary = useCallback((transacoes: Transacao[]) => {
    const summary = transacoes.reduce(
      (acc, t) => {
        if (t.tipo === 'receita') {
          acc.totalReceitas += t.valor;
        } else {
          acc.totalDespesas += t.valor;
        }
        return acc;
      },
      { totalReceitas: 0, totalDespesas: 0 }
    );

    const saldoAtual = summary.totalReceitas - summary.totalDespesas;
    
    // Calcular crescimento mensal
    const lastMonth = transacoes
      .filter(t => {
        const date = new Date(t.data_transacao);
        return date >= subMonths(filters.startDate, 1) && date < filters.startDate;
      })
      .reduce(
        (acc, t) => {
          if (t.tipo === 'receita') acc.receitas += t.valor;
          else acc.despesas += t.valor;
          return acc;
        },
        { receitas: 0, despesas: 0 }
      );

    const lastMonthSaldo = lastMonth.receitas - lastMonth.despesas;
    const crescimentoMensal = lastMonthSaldo !== 0 
      ? ((saldoAtual - lastMonthSaldo) / Math.abs(lastMonthSaldo)) * 100
      : 0;

    return {
      totalReceitas: summary.totalReceitas,
      totalDespesas: summary.totalDespesas,
      saldoAtual,
      crescimentoMensal,
    };
  }, [filters.startDate]);

  const fetchReportData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));

      // Calcular datas baseadas no período
      let startDate: Date;
      let endDate: Date = new Date();
      
      switch (filters.period) {
        case 'last30':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'last90':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'thisMonth':
          startDate = startOfMonth(new Date());
          break;
        case 'lastMonth':
          startDate = startOfMonth(subMonths(new Date(), 1));
          endDate = endOfMonth(subMonths(new Date(), 1));
          break;
        case 'thisYear':
          startDate = new Date(new Date().getFullYear(), 0, 1);
          break;
        case 'custom':
          if (!filters.startDate && !filters.endDate) {
            startDate = startOfMonth(new Date());
          } else {
            startDate = filters.startDate || startOfMonth(new Date());
            if (filters.endDate) {
              endDate = filters.endDate;
            }
          }
          break;
        default:
          startDate = startOfMonth(new Date());
      }

      // Buscar transações do período
      let query = supabase
        .from('transacoes')
        .select(`
          *,
          categorias:categoria_id(nome, cor)
        `)
        .eq('casal_id', casal?.id)
        .gte('data_transacao', startDate.toISOString())
        .lte('data_transacao', endDate.toISOString());

      // Aplicar filtros adicionais
      if (filters.type && filters.type !== 'all') {
        query = query.eq('tipo', filters.type);
      }

      if (filters.categories && filters.categories.length > 0) {
        query = query.in('categoria_id', filters.categories);
      }

      if (filters.accounts && filters.accounts.length > 0) {
        query = query.in('conta_id', filters.accounts);
      }

      if (filters.minValue) {
        query = query.gte('valor', parseFloat(filters.minValue));
      }

      if (filters.maxValue) {
        query = query.lte('valor', parseFloat(filters.maxValue));
      }

      query = query.order('data_transacao');

      const { data: transacoes, error: transacoesError } = await query;

      if (transacoesError) throw transacoesError;

      // Processar dados para gráficos
      const expensesByCategory = processExpensesByCategory(transacoes as Transacao[]);
      const incomeBySource = processIncomeBySource(transacoes as Transacao[]);
      const trends = processTrends(transacoes as Transacao[], filters.period);
      const summary = calculateSummary(transacoes as Transacao[]);

      setData({
        expensesByCategory,
        incomeBySource,
        trends,
        summary,
        loading: false,
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error instanceof Error ? error.message : 'Erro desconhecido');
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [
    casal?.id,
    filters.startDate,
    filters.endDate,
    filters.period,
    filters.type,
    filters.categories,
    filters.accounts,
    filters.minValue,
    filters.maxValue,
    processExpensesByCategory,
    processIncomeBySource,
    processTrends,
    calculateSummary,
  ]);

  useEffect(() => {
    if (!casal?.id) return;
    fetchReportData();
  }, [casal?.id, fetchReportData]);

  return {
    data,
    filters,
    setFilters,
    refetch: fetchReportData,
  };
}
