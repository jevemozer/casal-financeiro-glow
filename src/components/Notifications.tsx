import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationIconProps {
  type: string;
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  type,
  className,
}) => {
  const iconProps = { className: cn('h-4 w-4', className) };

  switch (type) {
    case 'meta_proxima_prazo':
      return <Clock {...iconProps} />;
    case 'meta_concluida':
      return <CheckCircle {...iconProps} />;
    case 'orcamento_estourado':
      return <AlertTriangle {...iconProps} />;
    case 'orcamento_proximo_limite':
      return <TrendingUp {...iconProps} />;
    case 'meta_progresso':
      return <Target {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'meta_concluida':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'meta_proxima_prazo':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'orcamento_estourado':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'orcamento_proximo_limite':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Agora mesmo';
    }
  };

  return (
    <div
      className={cn(
        'relative p-4 border rounded-lg transition-all duration-200 cursor-pointer',
        getNotificationColor(notification.type),
        !notification.isRead && 'ring-2 ring-primary/20',
        isHovered && 'scale-[1.02] shadow-md',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon
            type={notification.type}
            className={cn(
              'h-5 w-5',
              notification.type === 'meta_concluida' && 'text-green-600',
              notification.type === 'meta_proxima_prazo' && 'text-orange-600',
              notification.type === 'orcamento_estourado' && 'text-red-600',
              notification.type === 'orcamento_proximo_limite' &&
                'text-yellow-600',
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {notification.message}
              </p>
            </div>

            {!notification.isRead && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </span>

            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotificationsProps {
  className?: string;
  showBadge?: boolean;
}

export const Notifications: React.FC<NotificationsProps> = ({
  className,
  showBadge = true,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleRefresh = () => {
    refreshNotifications();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('relative p-2 h-auto', className)}
        >
          <Bell className="h-5 w-5" />
          {showBadge && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-1"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="w-4 h-4 rotate-45 border-2 border-current border-t-transparent rounded-sm" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="p-4 space-y-3">
                {error && (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-2"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                )}

                {isLoading && notifications.length === 0 && (
                  <div className="text-center py-8">
                    <LoadingSpinner
                      size="md"
                      text="Carregando notificações..."
                    />
                  </div>
                )}

                {!isLoading && notifications.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nenhuma notificação</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Você será notificado sobre metas e orçamentos
                    </p>
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Componente de badge simples para notificações
export const NotificationBadge: React.FC<{
  count: number;
  className?: string;
}> = ({ count, className }) => {
  if (count === 0) return null;

  return (
    <Badge
      variant="destructive"
      className={cn(
        'absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};

// Componente de lista de notificações para uso em outras páginas
export const NotificationList: React.FC<{
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  className?: string;
}> = ({ notifications, onMarkAsRead, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};
