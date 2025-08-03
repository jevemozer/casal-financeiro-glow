import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Notifications, NotificationList } from '@/components/Notifications';
import {
  Bell,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export default function NotificationExample() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const [showDetails, setShowDetails] = useState(false);

  const getNotificationStats = () => {
    const stats = {
      total: notifications.length,
      unread: unreadCount,
      byType: {
        meta_proxima_prazo: 0,
        meta_concluida: 0,
        orcamento_estourado: 0,
        orcamento_proximo_limite: 0,
      },
    };

    notifications.forEach((notification) => {
      if (stats.byType[notification.type] !== undefined) {
        stats.byType[notification.type]++;
      }
    });

    return stats;
  };

  const stats = getNotificationStats();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exemplo de Notificações</h1>
        <div className="flex items-center gap-4">
          <Notifications />
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Notificações no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Badge variant="destructive" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">Aguardando leitura</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byType.meta_proxima_prazo + stats.byType.meta_concluida}
            </div>
            <p className="text-xs text-muted-foreground">
              Próximas do prazo e concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byType.orcamento_estourado +
                stats.byType.orcamento_proximo_limite}
            </div>
            <p className="text-xs text-muted-foreground">
              Estourados e próximos do limite
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por Tipo */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Metas Próximas do Prazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications
                  .filter((n) => n.type === 'meta_proxima_prazo')
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-orange-50 rounded-lg"
                    >
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                {notifications.filter((n) => n.type === 'meta_proxima_prazo')
                  .length === 0 && (
                  <p className="text-sm text-gray-500">
                    Nenhuma meta próxima do prazo
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Metas Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications
                  .filter((n) => n.type === 'meta_concluida')
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-green-50 rounded-lg"
                    >
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                {notifications.filter((n) => n.type === 'meta_concluida')
                  .length === 0 && (
                  <p className="text-sm text-gray-500">
                    Nenhuma meta concluída
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Orçamentos Estourados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications
                  .filter((n) => n.type === 'orcamento_estourado')
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-red-50 rounded-lg"
                    >
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                {notifications.filter((n) => n.type === 'orcamento_estourado')
                  .length === 0 && (
                  <p className="text-sm text-gray-500">
                    Nenhum orçamento estourado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                Orçamentos Próximos do Limite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications
                  .filter((n) => n.type === 'orcamento_proximo_limite')
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-yellow-50 rounded-lg"
                    >
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                {notifications.filter(
                  (n) => n.type === 'orcamento_proximo_limite',
                ).length === 0 && (
                  <p className="text-sm text-gray-500">
                    Nenhum orçamento próximo do limite
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={refreshNotifications}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw
                className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')}
              />
              {isLoading ? 'Atualizando...' : 'Atualizar Notificações'}
            </Button>

            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="secondary">
                Marcar Todas como Lidas
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">Erro: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista Completa */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nenhuma notificação</p>
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkAsRead={markAsRead}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
