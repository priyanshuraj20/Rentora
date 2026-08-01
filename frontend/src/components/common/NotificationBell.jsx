import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

export default function NotificationBell() {
  const { notifications, unreadCount, setNotifications, clearUnread } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.data || []);
        }
      })
      .catch((err) => console.error("Error loading notifications:", err));
  }, [setNotifications]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      clearUnread();
      fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications/read`, {
        method: "PATCH",
        credentials: "include",
      }).catch(console.error);
    }
  };

  const handleNotificationClick = (n) => {
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    } else if (n.title?.toLowerCase().includes("message")) {
      navigate("/messages");
    } else {
      navigate("/bookings");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-text-secondary hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bright text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-surface-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-app/50">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-secondary">
                No notifications yet
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n._id || i}
                  onClick={() => handleNotificationClick(n)}
                  className="p-3 hover:bg-app/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-bright">{n.title}</span>
                    <span className="text-[10px] text-text-secondary">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
