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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
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
  BellRing,
  ChevronRight,
  Activity,
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
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    data?: {
      valor?: number;
      progresso?: number;
      meta?: string;
      categoria?: string;
    };
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getNotificationStyle = (type: string) => {
    const baseClasses = 'transition-all duration-300 animate-in fade-in-50';
    switch (type) {
      case 'meta_concluida':
        return {
          container: `${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100`,
          icon: 'text-green-500',
          border: 'border-green-200',
          progress: 'bg-green-500'
        };
      case 'meta_proxima_prazo':
        return {
          container: `${baseClasses} bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100`,
          icon: 'text-orange-500',
          border: 'border-orange-200',
          progress: 'bg-orange-500'
        };
      case 'orcamento_estourado':
        return {
          container: `${baseClasses} bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100`,
          icon: 'text-red-500',
          border: 'border-red-200',
          progress: 'bg-red-500'
        };
      case 'orcamento_proximo_limite':
        return {
          container: `${baseClasses} bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100`,
          icon: 'text-yellow-500',
          border: 'border-yellow-200',
          progress: 'bg-yellow-500'
        };
      default:
        return {
          container: `${baseClasses} bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100`,
          icon: 'text-purple-500',
          border: 'border-purple-200',
          progress: 'bg-purple-500'
        };
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

  const style = getNotificationStyle(notification.type);

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg shadow-sm group cursor-pointer',
        style.container,
        style.border,
        !notification.isRead && 'ring-2 ring-purple-500/20',
        isHovered && 'scale-[1.02] shadow-md',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-white to-gray-50',
            'group-hover:scale-110 transition-transform duration-300',
            style.border
          )}>
            <NotificationIcon
              type={notification.type}
              className={cn('h-5 w-5', style.icon)}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {notification.message}
              </p>
            </div>

            {!notification.isRead && (
              <div className="flex-shrink-0">
                <div className={cn(
                  'w-2 h-2 rounded-full animate-pulse',
                  style.progress
                )} />
              </div>
            )}
          </div>

          {notification.data?.progresso !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Progresso</span>
                <span className={style.icon}>{notification.data.progresso}%</span>
              </div>
              <Progress 
                value={notification.data.progresso} 
                className={cn("h-1.5", style.progress)}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDate(notification.createdAt)}
              </span>
            </div>

            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 opacity-0 group-hover:opacity-100 transition-all',
                  'hover:bg-white/50'
                )}
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

// Componente de badge moderno para notificações
export const NotificationBadge: React.FC<{
  count: number;
  className?: string;
}> = ({ count, className }) => {
  if (count === 0) return null;

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Badge
          className={cn(
            'absolute -top-1 -right-1',
            'h-5 min-w-[20px] px-1',
            'rounded-full',
            'bg-gradient-to-r from-red-500 to-pink-500',
            'flex items-center justify-center',
            'text-[11px] font-medium text-white',
            'shadow-sm shadow-red-500/20',
            'transition-all duration-300',
            'group-hover:scale-110',
            'animate-in fade-in-0 zoom-in-75',
            className,
          )}
        >
          {count > 99 ? '99+' : count}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-auto p-2">
        <p className="text-xs">
          {count} {count === 1 ? 'notificação' : 'notificações'} não {count === 1 ? 'lida' : 'lidas'}
        </p>
      </HoverCardContent>
    </HoverCard>
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
