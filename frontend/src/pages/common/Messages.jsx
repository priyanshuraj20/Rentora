import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, ShieldCheck, Search, CheckCheck, Bell, Loader2 } from "lucide-react";
import useAuth from "../../hooks/authHook";
import { useSocket } from "../../context/SocketContext";

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();
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
          if (mappedConvs.length > 0 && !activeConvId) {
            setActiveConvId(mappedConvs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load chat conversations:", err);
      } finally {
        setLoadingConvs(false);
      }
    };

    fetchConversations();
  }, [user]);

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
          setMessages(data.messages || []);
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

  // 3. Socket.io Live Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMsg) => {
      if (newMsg.bookingId === activeConvId) {
        setMessages((prev) => {
          // Avoid duplicate messages if already present
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleMessageSent = (sentMsg) => {
      if (sentMsg.bookingId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent", handleMessageSent);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent", handleMessageSent);
    };
  }, [socket, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // 4. Send Message via Socket + HTTP Fallback
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId) return;

    const textToSend = input.trim();
    setInput("");

    // Option A: Emit via Socket.io
    if (socket && socket.connected) {
      socket.emit("send_message", {
        bookingId: activeConvId,
        text: textToSend,
        type: "text",
      });
    } else {
      // Option B: HTTP Fallback if socket is offline
      try {
        const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
          method: "GET",
          credentials: "include",
        });
        const csrfData = await csrfRes.json();

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken,
          },
          body: JSON.stringify({
            bookingId: activeConvId,
            text: textToSend,
            type: "text",
          }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.data) {
          setMessages((prev) => [...prev, data.data]);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error("HTTP send message error:", err);
      }
    }
  };

  return (
    <main className="min-h-[85vh] bg-app px-4 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="bg-surface border border-divider/20 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[75vh] shadow-2xl">
        {/* Left Sidebar: Live Conversations */}
        <div className="md:col-span-4 border-r border-divider/20 flex flex-col bg-app/30">
          <div className="p-4 border-b border-divider/20 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-bright size-5" />
                <span>Rental Inquiries</span>
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-full">
                Socket JWT Auth
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-text-secondary size-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-surface border border-divider/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-text-secondary focus:outline-none focus:border-bright/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-divider/10">
            {loadingConvs ? (
              <div className="p-8 text-center text-text-secondary font-medium flex items-center justify-center gap-2">
                <Loader2 className="size-5 animate-spin text-bright" />
                <span>Loading conversations...</span>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors cursor-pointer ${
                    activeConvId === conv.id ? "bg-bright/10 border-l-4 border-bright" : "hover:bg-surface/50"
                  }`}
                >
                  <img
                    src={conv.partnerAvatar}
                    alt={conv.partnerName}
                    className="size-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-bold text-white truncate">{conv.partnerName}</h4>
                      <span className="text-[10px] text-text-secondary uppercase">{conv.status}</span>
                    </div>
                    <p className="text-xs text-bright font-medium truncate mb-1">{conv.itemTitle}</p>
                    <p className="text-[10px] text-text-secondary">Amount: ₹{conv.totalAmount}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <Bell className="size-10 text-text-secondary mx-auto opacity-40" />
                <p className="text-sm font-bold text-white">No Rental Conversations</p>
                <p className="text-xs text-text-secondary">
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
              <div className="p-4 border-b border-divider/20 flex items-center justify-between bg-app/20">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.partnerAvatar}
                    alt={activeConv.partnerName}
                    className="size-11 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-white">{activeConv.partnerName}</h3>
                    <p className="text-xs text-bright font-medium">{activeConv.itemTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold">
                  <ShieldCheck size={16} />
                  <span>Verified Booking Chat</span>
                </div>
              </div>

              {/* Thread Feed */}
              <div ref={chatFeedRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12 text-text-secondary text-sm font-medium gap-2">
                    <Loader2 className="size-5 animate-spin text-bright" />
                    <span>Loading chat history...</span>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id || msg.senderId === user?._id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? "bg-bright text-app font-medium rounded-tr-none shadow-md"
                              : "bg-app border border-divider/20 text-white rounded-tl-none"
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-text-secondary mt-1 px-1 flex items-center gap-1">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {isMe && <CheckCheck size={12} className="text-bright" />}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 text-text-secondary space-y-2">
                    <MessageSquare className="size-10 text-bright/40 mx-auto" />
                    <p className="text-sm font-bold text-white">Start the conversation</p>
                    <p className="text-xs max-w-xs mx-auto">
                      Send a message regarding pickup location, rental terms, or product details.
                    </p>
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-divider/20 flex gap-3 bg-app/20">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${activeConv.partnerName}...`}
                  className="flex-1 bg-surface border border-divider/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-bright/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-bright text-app font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="size-16 text-text-secondary opacity-30" />
              <h3 className="text-xl font-bold text-white">Select a Conversation</h3>
              <p className="text-sm text-text-secondary max-w-sm">
                Choose a booking from the left panel to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
