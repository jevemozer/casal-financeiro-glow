import { supabase } from '@/integrations/supabase/client';

// Tipos para notificações
export type NotificationType = 'meta_proxima_prazo' | 'meta_concluida' | 'orcamento_estourado' | 'orcamento_proximo_limite' | 'meta_progresso';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  casalId: string;
}

export interface MetaNotification {
  id: string;
  titulo: string;
  valor_objetivo: number;
  valor_atual: number;
  data_objetivo: string;
  progresso: number;
  dias_restantes: number;
}

export interface OrcamentoNotification {
  id: string;
  categoria_nome: string;
  valor_limite: number;
  valor_gasto: number;
  percentual_usado: number;
  mes: number;
  ano: number;
}

// Função para calcular progresso de metas
export function calculateMetaProgress(valorAtual: number, valorObjetivo: number): number {
  if (valorObjetivo === 0) return 0;
  return Math.min((valorAtual / valorObjetivo) * 100, 100);
}

// Função para calcular dias restantes até a data objetivo
export function calculateDiasRestantes(dataObjetivo: string): number {
  const hoje = new Date();
  const objetivo = new Date(dataObjetivo);
  const diffTime = objetivo.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Função para verificar metas próximas do prazo
export async function checkMetasProximasPrazo(casalId: string): Promise<MetaNotification[]> {
  try {
    const hoje = new Date();
    const proximos30Dias = new Date();
    proximos30Dias.setDate(hoje.getDate() + 30);

    const { data: metas, error } = await supabase
      .from('metas')
      .select('*')
      .eq('casal_id', casalId)
      .eq('status', 'ativa')
      .gte('data_objetivo', hoje.toISOString().split('T')[0])
      .lte('data_objetivo', proximos30Dias.toISOString().split('T')[0])
      .order('data_objetivo', { ascending: true });

    if (error) throw error;

    return (metas || []).map(meta => ({
      id: meta.id,
      titulo: meta.titulo,
      valor_objetivo: meta.valor_objetivo,
      valor_atual: meta.valor_atual,
      data_objetivo: meta.data_objetivo,
      progresso: calculateMetaProgress(meta.valor_atual, meta.valor_objetivo),
      dias_restantes: calculateDiasRestantes(meta.data_objetivo)
    }));
  } catch (error) {
    console.error('Erro ao verificar metas próximas do prazo:', error);
    return [];
  }
}

// Função para verificar metas concluídas
export async function checkMetasConcluidas(casalId: string): Promise<MetaNotification[]> {
  try {
    const { data: metas, error } = await supabase
      .from('metas')
      .select('*')
      .eq('casal_id', casalId)
      .eq('status', 'ativa');

    if (error) throw error;

    // Filtrar metas onde valor_atual >= valor_objetivo
    const metasConcluidas = (metas || []).filter(meta => 
      meta.valor_atual >= meta.valor_objetivo
    );

    return metasConcluidas.map(meta => ({
      id: meta.id,
      titulo: meta.titulo,
      valor_objetivo: meta.valor_objetivo,
      valor_atual: meta.valor_atual,
      data_objetivo: meta.data_objetivo,
      progresso: calculateMetaProgress(meta.valor_atual, meta.valor_objetivo),
      dias_restantes: calculateDiasRestantes(meta.data_objetivo)
    }));
  } catch (error) {
    console.error('Erro ao verificar metas concluídas:', error);
    return [];
  }
}

// Função para verificar orçamentos estourados
export async function checkOrcamentosEstourados(casalId: string): Promise<OrcamentoNotification[]> {
  try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // Buscar orçamentos do mês atual
    const { data: orcamentos, error: orcamentosError } = await supabase
      .from('orcamentos')
      .select(`
        *,
        categorias!inner(nome)
      `)
      .eq('casal_id', casalId)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual);

    if (orcamentosError) throw orcamentosError;

    const orcamentosEstourados: OrcamentoNotification[] = [];

    for (const orcamento of orcamentos || []) {
      // Calcular gastos da categoria no mês
      const { data: gastos, error: gastosError } = await supabase
        .from('transacoes')
        .select('valor')
        .eq('casal_id', casalId)
        .eq('categoria_id', orcamento.categoria_id)
        .eq('tipo', 'despesa')
        .gte('data_transacao', `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`)
        .lt('data_transacao', `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-01`);

      if (gastosError) continue;

      const valorGasto = (gastos || []).reduce((total, transacao) => total + transacao.valor, 0);
      const percentualUsado = (valorGasto / orcamento.valor_limite) * 100;

      if (percentualUsado > 100) {
        orcamentosEstourados.push({
          id: orcamento.id,
          categoria_nome: orcamento.categorias.nome,
          valor_limite: orcamento.valor_limite,
          valor_gasto: valorGasto,
          percentual_usado: percentualUsado,
          mes: orcamento.mes,
          ano: orcamento.ano
        });
      }
    }

    return orcamentosEstourados;
  } catch (error) {
    console.error('Erro ao verificar orçamentos estourados:', error);
    return [];
  }
}

// Função para verificar orçamentos próximos do limite
export async function checkOrcamentosProximosLimite(casalId: string): Promise<OrcamentoNotification[]> {
  try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // Buscar orçamentos do mês atual
    const { data: orcamentos, error: orcamentosError } = await supabase
      .from('orcamentos')
      .select(`
        *,
        categorias!inner(nome)
      `)
      .eq('casal_id', casalId)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual);

    if (orcamentosError) throw orcamentosError;

    const orcamentosProximos: OrcamentoNotification[] = [];

    for (const orcamento of orcamentos || []) {
      // Calcular gastos da categoria no mês
      const { data: gastos, error: gastosError } = await supabase
        .from('transacoes')
        .select('valor')
        .eq('casal_id', casalId)
        .eq('categoria_id', orcamento.categoria_id)
        .eq('tipo', 'despesa')
        .gte('data_transacao', `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`)
        .lt('data_transacao', `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-01`);

      if (gastosError) continue;

      const valorGasto = (gastos || []).reduce((total, transacao) => total + transacao.valor, 0);
      const percentualUsado = (valorGasto / orcamento.valor_limite) * 100;

      // Alertar quando estiver entre 80% e 100%
      if (percentualUsado >= 80 && percentualUsado < 100) {
        orcamentosProximos.push({
          id: orcamento.id,
          categoria_nome: orcamento.categorias.nome,
          valor_limite: orcamento.valor_limite,
          valor_gasto: valorGasto,
          percentual_usado: percentualUsado,
          mes: orcamento.mes,
          ano: orcamento.ano
        });
      }
    }

    return orcamentosProximos;
  } catch (error) {
    console.error('Erro ao verificar orçamentos próximos do limite:', error);
    return [];
  }
}

// Função para gerar notificações baseadas nos dados
export async function generateNotifications(casalId: string): Promise<Notification[]> {
  const notifications: Notification[] = [];

  try {
    // Verificar metas próximas do prazo
    const metasProximas = await checkMetasProximasPrazo(casalId);
    metasProximas.forEach(meta => {
      notifications.push({
        id: `meta_proxima_${meta.id}`,
        type: 'meta_proxima_prazo',
        title: 'Meta próxima do prazo',
        message: `A meta "${meta.titulo}" vence em ${meta.dias_restantes} dias. Progresso: ${meta.progresso.toFixed(1)}%`,
        data: meta,
        isRead: false,
        createdAt: new Date().toISOString(),
        casalId
      });
    });

    // Verificar metas concluídas
    const metasConcluidas = await checkMetasConcluidas(casalId);
    metasConcluidas.forEach(meta => {
      notifications.push({
        id: `meta_concluida_${meta.id}`,
        type: 'meta_concluida',
        title: 'Meta concluída!',
        message: `Parabéns! A meta "${meta.titulo}" foi alcançada!`,
        data: meta,
        isRead: false,
        createdAt: new Date().toISOString(),
        casalId
      });
    });

    // Verificar orçamentos estourados
    const orcamentosEstourados = await checkOrcamentosEstourados(casalId);
    orcamentosEstourados.forEach(orcamento => {
      notifications.push({
        id: `orcamento_estourado_${orcamento.id}`,
        type: 'orcamento_estourado',
        title: 'Orçamento estourado',
        message: `O orçamento de ${orcamento.categoria_nome} foi ultrapassado em ${(orcamento.percentual_usado - 100).toFixed(1)}%`,
        data: orcamento,
        isRead: false,
        createdAt: new Date().toISOString(),
        casalId
      });
    });

    // Verificar orçamentos próximos do limite
    const orcamentosProximos = await checkOrcamentosProximosLimite(casalId);
    orcamentosProximos.forEach(orcamento => {
      notifications.push({
        id: `orcamento_proximo_${orcamento.id}`,
        type: 'orcamento_proximo_limite',
        title: 'Orçamento próximo do limite',
        message: `O orçamento de ${orcamento.categoria_nome} está em ${orcamento.percentual_usado.toFixed(1)}% do limite`,
        data: orcamento,
        isRead: false,
        createdAt: new Date().toISOString(),
        casalId
      });
    });

  } catch (error) {
    console.error('Erro ao gerar notificações:', error);
  }

  return notifications;
} 