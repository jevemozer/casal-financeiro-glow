import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useCasal } from './useCasal';
import {
  generateNotifications,
  type Notification,
  type NotificationType,
} from '@/lib/notifications';
import { supabase } from '@/integrations/supabase/client';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const { casal } = useCasal();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar notificações do localStorage ou gerar novas
  const loadNotifications = useCallback(async () => {
    if (!user || !casal?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Tentar carregar do localStorage primeiro
      const storedNotifications = localStorage.getItem(
        `notifications_${casal.id}`,
      );
      let currentNotifications: Notification[] = [];

      if (storedNotifications) {
        currentNotifications = JSON.parse(storedNotifications);
      }

      // Gerar novas notificações baseadas nos dados atuais
      const newNotifications = await generateNotifications(casal.id);

      // Combinar notificações existentes com novas, evitando duplicatas
      const existingIds = new Set(currentNotifications.map((n) => n.id));
      const uniqueNewNotifications = newNotifications.filter(
        (n) => !existingIds.has(n.id),
      );

      const allNotifications = [
        ...currentNotifications,
        ...uniqueNewNotifications,
      ];

      // Salvar no localStorage
      localStorage.setItem(
        `notifications_${casal.id}`,
        JSON.stringify(allNotifications),
      );
      setNotifications(allNotifications);
    } catch (err) {
      setError('Erro ao carregar notificações');
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, casal?.id]);

  // Marcar notificação como lida
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!casal?.id) return;

      try {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );

        // Atualizar localStorage
        const updatedNotifications = notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        );
        localStorage.setItem(
          `notifications_${casal.id}`,
          JSON.stringify(updatedNotifications),
        );
      } catch (err) {
        console.error('Erro ao marcar notificação como lida:', err);
      }
    },
    [notifications, casal?.id],
  );

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!casal?.id) return;

    try {
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      setNotifications(updatedNotifications);
      localStorage.setItem(
        `notifications_${casal.id}`,
        JSON.stringify(updatedNotifications),
      );
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  }, [notifications, casal?.id]);

  // Recarregar notificações
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calcular contador de não lidas
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Carregar notificações quando o casal mudar
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Atualizar notificações periodicamente (a cada 5 minutos)
  useEffect(() => {
    if (!casal?.id) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [loadNotifications, casal?.id]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    clearError,
  };
}

// Hook para notificações específicas por tipo
export function useNotificationsByType(type: NotificationType) {
  const { notifications, ...rest } = useNotifications();

  const filteredNotifications = notifications.filter((n) => n.type === type);

  return {
    notifications: filteredNotifications,
    ...rest,
  };
}

// Hook para notificações não lidas
export function useUnreadNotifications() {
  const { notifications, ...rest } = useNotifications();

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return {
    notifications: unreadNotifications,
    ...rest,
  };
}
