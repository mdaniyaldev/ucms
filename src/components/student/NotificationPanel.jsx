import { X, AlertCircle, CheckCircle, Info, Clock } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationPanel({ open, onClose }) {
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "status_update":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "escalation":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNotificationBgColor = (isRead) => {
    return isRead
      ? "bg-white dark:bg-slate-800"
      : "bg-blue-50 dark:bg-slate-700";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-16 right-0 bottom-0 z-50
          w-full sm:w-96
          bg-white dark:bg-slate-900
          border-l border-slate-200 dark:border-slate-800
          flex flex-col
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {unreadCount} unread
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800"
          >
            Mark all as read
          </button>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-slate-500 dark:text-slate-400">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">
                No notifications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800 ${getNotificationBgColor(
                    notif.is_read
                  )}`}
                  onClick={() => {
                    if (!notif.is_read) {
                      markRead(notif.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <div className="shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
