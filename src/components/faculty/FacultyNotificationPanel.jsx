import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { Button } from "../ui/button";
import {
    listMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../../lib/faculty";

export default function FacultyNotificationPanel({ onClose, onUpdate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const panelRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await listMyNotifications({ limit: 20 });
                setNotifications(data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkRead = async (notificationId) => {
        try {
            await markNotificationRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            onUpdate?.();
        } catch (err) {
            console.error("Error marking notification read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            onUpdate?.();
        } catch (err) {
            console.error("Error marking all notifications read:", err);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-GB");
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case "new_complaint":
                return "text-blue-600 dark:text-blue-400";
            case "status_update":
                return "text-indigo-600 dark:text-indigo-400";
            case "comment_added":
                return "text-green-600 dark:text-green-400";
            case "escalation":
                return "text-orange-600 dark:text-orange-400";
            case "resolved":
                return "text-emerald-600 dark:text-emerald-400";
            default:
                return "text-slate-600 dark:text-slate-400";
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-[400px] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-indigo-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                        Notifications
                    </span>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs"
                        >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="w-8 h-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={`p-4 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer transition ${!notification.is_read
                                        ? "bg-indigo-50/50 dark:bg-slate-800/50"
                                        : ""
                                    }`}
                                onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm font-medium ${getNotificationColor(
                                                notification.type
                                            )}`}
                                        >
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            {formatTime(notification.created_at)}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
