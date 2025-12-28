import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  listMyNotifications,
  getUnreadNotificationCount,
  subscribeToMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../lib/student";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial notifications
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let mounted = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const [notifData, count] = await Promise.all([
          listMyNotifications({ limit: 50 }),
          getUnreadNotificationCount(),
        ]);

        if (mounted) {
          setNotifications(notifData || []);
          setUnreadCount(count || 0);
        }
      } catch (err) {
        console.error("[NotificationContext] loadNotifications error:", err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe;

    const setupSubscription = async () => {
      try {
        unsubscribe = await subscribeToMyNotifications((newNotification) => {
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });
      } catch (err) {
        console.error("[NotificationContext] subscription error:", err);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  const markRead = useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[NotificationContext] markRead error:", err);
      throw err;
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("[NotificationContext] markAllRead error:", err);
      throw err;
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
}