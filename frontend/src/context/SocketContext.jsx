import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/authHook";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const backendHost = import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace("/api/v1", "")
      : "http://localhost:3000";

    const socketInstance = io(backendHost, {
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      const userId = user.id || user._id;
      if (userId) {
        socketInstance.emit("join", userId);
      }
    });

    socketInstance.on("notification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const clearUnread = () => setUnreadCount(0);

  return (
    <SocketContext.Provider
      value={{ socket, notifications, unreadCount, setNotifications, clearUnread }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
