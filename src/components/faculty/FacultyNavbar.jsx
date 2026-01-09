import { Menu, Bell } from "lucide-react";
import { Button } from "../ui/button";
import ThemeToggle from "../ThemeToggle";
import FacultyNotificationPanel from "./FacultyNotificationPanel";
import { useState, useEffect } from "react";
import { getUnreadNotificationCount, subscribeToMyNotifications } from "../../lib/faculty";

export default function FacultyNavbar({ setMobileOpen }) {
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch initial unread count
    useEffect(() => {
        let unsubscribe;

        const fetchCount = async () => {
            try {
                const count = await getUnreadNotificationCount();
                setUnreadCount(count);
            } catch (err) {
                console.error("Error fetching notification count:", err);
            }
        };

        fetchCount();

        // Subscribe to real-time notifications
        (async () => {
            unsubscribe = await subscribeToMyNotifications(() => {
                fetchCount(); // Refresh count on new notification
            });
        })();

        return () => unsubscribe?.();
    }, []);

    const handleNotificationUpdate = () => {
        // Refetch count when notifications are marked as read
        getUnreadNotificationCount().then(setUnreadCount).catch(console.error);
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-indigo-200 dark:border-slate-800 flex items-center justify-between px-4">
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
            >
                <Menu className="w-5 h-5" />
            </Button>

            {/* Page title - hidden on mobile */}
            <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                    Faculty Portal
                </h2>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                <ThemeToggle />

                {/* Notification bell */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setNotificationOpen(!notificationOpen)}
                        className="relative"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </Button>

                    {/* Notification dropdown */}
                    {notificationOpen && (
                        <FacultyNotificationPanel
                            onClose={() => setNotificationOpen(false)}
                            onUpdate={handleNotificationUpdate}
                        />
                    )}
                </div>
            </div>
        </header>
    );
}
