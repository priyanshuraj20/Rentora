import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Send, MessageSquare, ShieldCheck, Search, CheckCheck, Bell, Loader2 } from "lucide-react";
import useAuth from "../../hooks/authHook";
import { useSocket } from "../../context/SocketContext";

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const targetBookingId = location.state?.bookingId;

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatFeedRef = useRef(null);

  // Auto-scroll inside chat feed container without jumping page window
  const scrollToBottom = () => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTo({
        top: chatFeedRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 1. Load User Booking Conversations from Backend
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConvs(true);
        const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
          method: "GET",
          credentials: "include",
        });
        const csrfData = await csrfRes.json();

        const bookingRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken,
          },
          credentials: "include",
        });
        const bookingData = await bookingRes.json();

        if (bookingData.success && bookingData.bookings?.length > 0) {
          const isOwner = user?.role === "owner" || user?.roles === "owner";
          const mappedConvs = bookingData.bookings.map((b) => {
            const partnerInfo = isOwner ? b.renterInfo : b.ownerInfo;
            return {
              id: b.id,
              partnerName: partnerInfo?.name || (isOwner ? "Renter" : "Owner"),
              partnerAvatar:
                partnerInfo?.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerInfo?.name || "User")}&background=random`,
              itemTitle: b.item?.title || "Rental Item",
              itemImage: b.item?.image || null,
              status: b.status,
              paymentStatus: b.paymentStatus,
              totalAmount: b.totalAmount,
            };
          });

          setConversations(mappedConvs);
          if (mappedConvs.length > 0) {
            const matched = targetBookingId && mappedConvs.some((c) => c.id === targetBookingId);
            setActiveConvId(matched ? targetBookingId : mappedConvs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load chat conversations:", err);
      } finally {
        setLoadingConvs(false);
      }
    };

    fetchConversations();
  }, [user, targetBookingId]);

  // 2. Load Persisted Chat Messages for Selected Booking
  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
          method: "GET",
          credentials: "include",
        });
        const csrfData = await csrfRes.json();

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/messages/${activeConvId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken,
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.data || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConvId]);

  // 3. Socket Event Listeners for Real-Time Messages
  useEffect(() => {
    if (!socket || !activeConvId) return;

    // Join room for current active booking conversation
    socket.emit("join_room", { bookingId: activeConvId });

    const handleReceiveMessage = (incomingMsg) => {
      if (incomingMsg.bookingId === activeConvId) {
        setMessages((prev) => [...prev, incomingMsg]);
        setTimeout(scrollToBottom, 100);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // 4. Send Message via Socket & HTTP Fallback
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId) return;

    const msgText = input.trim();
    setInput("");

    const newMsgPayload = {
      bookingId: activeConvId,
      senderId: user?.id || user?._id,
      text: msgText,
      createdAt: new Date().toISOString(),
    };

    // Socket Emit
    if (socket) {
      socket.emit("send_message", newMsgPayload);
    }

    // HTTP Persistence Fallback
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken,
        },
        body: JSON.stringify({
          bookingId: activeConvId,
          text: msgText,
        }),
        credentials: "include",
      });

      if (!socket) {
        setMessages((prev) => [...prev, { ...newMsgPayload, id: Date.now() }]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error("HTTP send message error:", err);
    }
  };

  return (
    <main className="min-h-[85vh] bg-app px-4 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="bg-surface border border-divider rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[75vh] shadow-sm">
        {/* Left Sidebar: Live Conversations */}
        <div className="md:col-span-4 border-r border-divider flex flex-col bg-app/30">
          <div className="p-4 border-b border-divider space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 tracking-tight">
                <MessageSquare className="text-primary size-5" />
                <span>Rental Inquiries</span>
              </h2>
              <span className="bg-success/15 text-success border border-success/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Sync
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-text-muted size-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-surface border border-divider rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-divider custom-scrollbar">
            {loadingConvs ? (
              <div className="p-8 text-center text-text-muted font-medium text-xs flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Loading conversations...</span>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors cursor-pointer ${
                    activeConvId === conv.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-white/5"
                  }`}
                >
                  <img
                    src={conv.partnerAvatar}
                    alt={conv.partnerName}
                    className="size-11 rounded-full object-cover shrink-0 border border-divider"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xs font-bold text-text-primary truncate">{conv.partnerName}</h4>
                      <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">{conv.status}</span>
                    </div>
                    <p className="text-xs text-primary font-semibold truncate mb-0.5">{conv.itemTitle}</p>
                    <p className="text-[10px] text-text-muted font-medium">Amount: ₹{conv.totalAmount}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <Bell className="size-8 text-text-muted mx-auto" />
                <p className="text-xs font-bold text-text-primary">No Rental Conversations</p>
                <p className="text-[11px] text-text-secondary">
                  When you submit or receive rental bookings, live messaging channels will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Active Chat Window */}
        <div className="md:col-span-8 flex flex-col h-full bg-surface">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-divider flex items-center justify-between bg-app/20">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.partnerAvatar}
                    alt={activeConv.partnerName}
                    className="size-10 rounded-full object-cover border border-divider"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-text-primary">{activeConv.partnerName}</h3>
                    <p className="text-xs text-primary font-semibold">{activeConv.itemTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-success bg-success/15 border border-success/30 px-3 py-1 rounded-full font-bold">
                  <ShieldCheck size={14} />
                  <span>Verified Booking Chat</span>
                </div>
              </div>

              {/* Thread Feed */}
              <div ref={chatFeedRef} className="flex-1 p-6 overflow-y-auto space-y-3 custom-scrollbar">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12 text-text-muted text-xs font-medium gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading chat history...</span>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id || msg.senderId === user?._id;
                    return (
                      <div key={msg.id || msg.createdAt} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-primary text-text-primary font-medium rounded-tr-none shadow-sm"
                              : "bg-app border border-divider text-text-primary rounded-tl-none"
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-text-muted mt-1 px-1 flex items-center gap-1">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {isMe && <CheckCheck size={12} className="text-primary" />}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 text-text-muted space-y-2">
                    <MessageSquare className="size-8 text-primary/40 mx-auto" />
                    <p className="text-xs font-bold text-text-primary">Start the conversation</p>
                    <p className="text-[11px] max-w-xs mx-auto text-text-secondary">
                      Send a message regarding pickup location, rental terms, or product details.
                    </p>
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-divider flex gap-3 bg-app/20">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${activeConv.partnerName}...`}
                  className="flex-1 bg-app border border-divider rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-primary text-text-primary font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shadow-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="size-14 text-text-muted opacity-40" />
              <h3 className="text-lg font-bold text-text-primary">Select a Conversation</h3>
              <p className="text-xs text-text-secondary max-w-sm">
                Choose a booking from the left panel to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
