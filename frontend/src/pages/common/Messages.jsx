import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Send,
  MessageSquare,
  ShieldCheck,
  Search,
  CheckCheck,
  Bell,
  Loader2,
  MoreVertical,
  Trash2,
  Eraser,
  ExternalLink,
  BellOff,
  ShieldAlert,
  Copy,
  Check,
  Package,
  ArrowUpRight,
  ChevronDown,
  Paperclip,
  Image as ImageIcon,
  X,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/authHook";
import { useSocket } from "../../context/SocketContext";

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const targetBookingId = location.state?.bookingId;

  const isOwner = user?.role === "owner" || user?.roles === "owner";

  // Data states
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'completed'

  // Options & Dropdown states
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [mutedConvs, setMutedConvs] = useState({});
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [showQuickChips, setShowQuickChips] = useState(true);

  const chatFeedRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll inside chat feed container
  const scrollToBottom = (behavior = "smooth") => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTo({
        top: chatFeedRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Close options menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setOptionsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          const mappedConvs = bookingData.bookings.map((b) => {
            const partnerInfo = isOwner ? b.renterInfo : b.ownerInfo;
            return {
              id: b.id,
              booking: b,
              partnerName: partnerInfo?.name || (isOwner ? "Renter" : "Owner"),
              partnerAvatar:
                partnerInfo?.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  partnerInfo?.name || "User"
                )}&background=random`,
              itemTitle: b.item?.title || "Rental Item",
              itemImage: b.item?.image || null,
              itemCategory: b.item?.category || "Equipment",
              status: b.status,
              paymentStatus: b.paymentStatus,
              totalAmount: b.totalAmount,
              securityDeposit: b.securityDeposit || b.escrowDeposit || 0,
              startDate: b.startDate,
              endDate: b.endDate,
              handoverConfirmedAt: b.handoverConfirmedAt,
              returnConfirmedAt: b.returnConfirmedAt,
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
  }, [user, targetBookingId, isOwner]);

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
          setMessages(data.messages || data.data || []);
          setTimeout(() => scrollToBottom("auto"), 100);
        }
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConvId]);

  // 3. Socket Event Listeners for Real-Time Messages & Deletions
  useEffect(() => {
    if (!socket || !activeConvId) return;

    socket.emit("join_room", { bookingId: activeConvId });

    const handleReceiveMessage = (incomingMsg) => {
      if (incomingMsg.bookingId === activeConvId) {
        setMessages((prev) => [...prev, incomingMsg]);
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    };

    const handleMessageSent = (confirmedMsg) => {
      if (confirmedMsg.bookingId === activeConvId) {
        setMessages((prev) => [...prev, confirmedMsg]);
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    };

    const handleMessageDeleted = ({ messageId, bookingId }) => {
      if (bookingId === activeConvId) {
        setMessages((prev) => prev.filter((m) => (m.id || m._id) !== messageId));
      }
    };

    const handleConversationCleared = ({ bookingId }) => {
      if (bookingId === activeConvId) {
        setMessages([]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("conversation_cleared", handleConversationCleared);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("conversation_cleared", handleConversationCleared);
    };
  }, [socket, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // 4. Send Message via Socket & HTTP Fallback
  const handleSendMessage = async (textToSend) => {
    const msgText = (textToSend || input).trim();
    if (!msgText || !activeConvId) return;

    setInput("");

    const newMsgPayload = {
      bookingId: activeConvId,
      senderId: user?.id || user?._id,
      text: msgText,
      type: "text",
      createdAt: new Date().toISOString(),
    };

    if (socket) {
      socket.emit("send_message", newMsgPayload);
    } else {
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

        setMessages((prev) => [...prev, { ...newMsgPayload, id: Date.now() }]);
        setTimeout(() => scrollToBottom("smooth"), 100);
      } catch (err) {
        console.error("HTTP send message error:", err);
        toast.error("Failed to deliver message");
      }
    }
  };

  // 5. Delete Single Message
  const handleDeleteMessage = async (messageId) => {
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/messages/single/${messageId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfData.csrfToken,
        },
        credentials: "include",
      });

      setMessages((prev) => prev.filter((m) => (m.id || m._id) !== messageId));
      if (socket) {
        socket.emit("delete_message", { messageId, bookingId: activeConvId });
      }
      toast.success("Message deleted");
    } catch (err) {
      console.error("Delete message error:", err);
      toast.error("Failed to delete message");
    }
  };

  // 6. Clear All Messages in Conversation
  const handleClearChat = async () => {
    if (!activeConvId) return;
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/messages/${activeConvId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfData.csrfToken,
        },
        credentials: "include",
      });

      setMessages([]);
      if (socket) {
        socket.emit("clear_conversation", { bookingId: activeConvId });
      }
      setShowClearModal(false);
      setOptionsMenuOpen(false);
      toast.success("Chat history cleared");
    } catch (err) {
      console.error("Clear chat error:", err);
      toast.error("Failed to clear chat");
    }
  };

  // 7. Delete Full Conversation from List
  const handleDeleteConversation = async (convId) => {
    const targetId = convId || activeConvId;
    if (!targetId) return;
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/messages/${targetId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": csrfData.csrfToken,
        },
        credentials: "include",
      });

      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== targetId);
        if (activeConvId === targetId) {
          setActiveConvId(updated.length > 0 ? updated[0].id : null);
        }
        return updated;
      });

      setShowDeleteModal(false);
      setOptionsMenuOpen(false);
      toast.success("Conversation deleted");
    } catch (err) {
      console.error("Delete conversation error:", err);
      toast.error("Failed to delete conversation");
    }
  };

  // Copy Message Text
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    toast.success("Copied to clipboard", { duration: 1500 });
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Toggle Mute Notifications
  const handleToggleMute = () => {
    if (!activeConvId) return;
    setMutedConvs((prev) => {
      const next = !prev[activeConvId];
      toast(next ? "🔇 Conversation muted" : "🔔 Notifications unmuted");
      return { ...prev, [activeConvId]: next };
    });
    setOptionsMenuOpen(false);
  };

  // Quick Action Chips
  const quickActions = [
    {
      label: "📍 Share Pickup Location",
      text: "📍 Pickup Location: Let's meet at the agreed pickup address for gear handover.",
    },
    {
      label: "🕒 Pickup Timing",
      text: "🕒 Hi! What time works best for you today to coordinate the equipment handover?",
    },
    {
      label: "📸 Condition Check",
      text: "📸 Let's inspect all equipment accessories, lenses, and batteries together at pickup.",
    },
    {
      label: isOwner ? "🔑 Request Handover PIN" : "🔑 Handover PIN Ready",
      text: isOwner
        ? "🔑 Please share your 6-digit Handover PIN upon arrival so I can verify and start the rental."
        : "🔑 I have my 6-digit Handover PIN ready on my Rentora app for verification.",
    },
    {
      label: "✅ Gear Received",
      text: "✅ Gear received in pristine condition. All accessories and tests verified!",
    },
  ];

  // Filter conversations
  const filteredConvs = conversations.filter((c) => {
    const matchesSearch =
      c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "active") {
      return ["confirmed", "ongoing", "pending"].includes(c.status);
    }
    if (statusFilter === "completed") {
      return ["completed", "cancelled"].includes(c.status);
    }
    return true;
  });

  const isMuted = activeConvId && mutedConvs[activeConvId];

  return (
    <main className="min-h-[85vh] bg-app px-3 sm:px-6 md:px-12 py-6 max-w-[1400px] mx-auto">
      <div
        id="owner-messages-header"
        className="bg-surface border border-divider rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[78vh] shadow-xl"
      >
        {/* ================= LEFT SIDEBAR: CONVERSATIONS ================= */}
        <div className="md:col-span-4 border-r border-divider flex flex-col bg-app/30">
          {/* Header & Live Status */}
          <div className="p-4 border-b border-divider space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2 tracking-tight">
                <MessageSquare className="text-primary size-5" />
                <span>Rental Inquiries</span>
              </h2>
              <span className="bg-success/15 text-success border border-success/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                <span>Live Sync</span>
              </span>
            </div>

            {/* Live Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-text-muted size-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, gear or status..."
                className="w-full bg-surface border border-divider rounded-xl pl-8 pr-8 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-primary text-text-primary shadow-sm"
                      : "bg-surface text-text-muted hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-text-muted font-medium">
                {filteredConvs.length} chat{filteredConvs.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-divider/70 custom-scrollbar">
            {loadingConvs ? (
              <div className="p-8 text-center text-text-muted font-medium text-xs flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredConvs.length > 0 ? (
              filteredConvs.map((conv) => {
                const isSelected = activeConvId === conv.id;
                const convMuted = mutedConvs[conv.id];
                return (
                  <div
                    key={conv.id}
                    className={`group relative flex items-center transition-all ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-white/5 border-l-4 border-transparent"
                    }`}
                  >
                    <button
                      onClick={() => setActiveConvId(conv.id)}
                      className="w-full text-left p-3.5 flex gap-3 cursor-pointer items-start min-w-0"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.partnerAvatar}
                          alt={conv.partnerName}
                          className="size-11 rounded-full object-cover border border-divider shadow-sm"
                        />
                        {convMuted && (
                          <div className="absolute -bottom-1 -right-1 size-4 bg-app rounded-full flex items-center justify-center border border-divider text-text-muted">
                            <BellOff size={10} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="text-xs font-bold text-text-primary truncate">{conv.partnerName}</h4>
                          <span
                            className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                              conv.status === "confirmed"
                                ? "text-emerald-400 bg-emerald-500/10"
                                : conv.status === "ongoing"
                                ? "text-primary bg-primary/10"
                                : conv.status === "completed"
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-text-muted bg-surface"
                            }`}
                          >
                            {conv.status}
                          </span>
                        </div>
                        <p className="text-xs text-primary font-semibold truncate mb-0.5">{conv.itemTitle}</p>
                        <p className="text-[10px] text-text-muted font-medium">
                          Total: ₹{conv.totalAmount?.toLocaleString("en-IN") || "0"}
                        </p>
                      </div>
                    </button>

                    {/* Quick Delete Conversation Hover Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveConvId(conv.id);
                        setShowDeleteModal(true);
                      }}
                      title="Delete conversation"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 mr-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2.5">
                <Bell className="size-8 text-text-muted/60 mx-auto" />
                <p className="text-xs font-bold text-text-primary">
                  {searchQuery ? "No matching conversations" : "No Rental Inquiries"}
                </p>
                <p className="text-[11px] text-text-secondary max-w-xs mx-auto">
                  {searchQuery
                    ? `No chats found matching "${searchQuery}". Clear search to view all.`
                    : "Confirmed and active rental bookings will appear here for live messaging."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 px-3 py-1 bg-surface hover:bg-white/10 rounded-lg text-xs text-text-primary border border-divider cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT AREA: ACTIVE CHAT ================= */}
        <div className="md:col-span-8 flex flex-col h-full bg-surface">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-divider flex items-center justify-between bg-app/25 relative">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={activeConv.partnerAvatar}
                      alt={activeConv.partnerName}
                      className="size-10 sm:size-11 rounded-full object-cover border border-divider shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full border-2 border-surface" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-text-primary truncate">
                        {activeConv.partnerName}
                      </h3>
                      {isMuted && (
                        <span className="text-[10px] text-text-muted flex items-center gap-1 bg-app px-1.5 py-0.5 rounded border border-divider">
                          <BellOff size={10} />
                          <span>Muted</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-primary font-semibold truncate flex items-center gap-1">
                      <span>{activeConv.itemTitle}</span>
                      <span className="text-text-muted text-[10px]">• ₹{activeConv.totalAmount}</span>
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-success bg-success/15 border border-success/30 px-2.5 py-1 rounded-full font-bold">
                    <ShieldCheck size={13} />
                    <span>Verified Booking Chat</span>
                  </div>

                  {/* 3-Dot Options Dropdown */}
                  <div className="relative" ref={optionsMenuRef}>
                    <button
                      type="button"
                      onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
                      className="p-2 rounded-xl bg-app hover:bg-white/10 border border-divider text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Chat Options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {optionsMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-surface border border-divider/90 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                        {/* Option 1: View Booking Details */}
                        <Link
                          to={isOwner ? "/bookings" : `/rentals/${activeConv.id}`}
                          onClick={() => setOptionsMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={14} className="text-primary" />
                          <span>View Booking Details</span>
                        </Link>

                        {/* Option 2: Mute / Unmute */}
                        <button
                          type="button"
                          onClick={handleToggleMute}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors cursor-pointer text-left"
                        >
                          {isMuted ? (
                            <>
                              <Bell size={14} className="text-emerald-400" />
                              <span>Unmute Notifications</span>
                            </>
                          ) : (
                            <>
                              <BellOff size={14} className="text-text-muted" />
                              <span>Mute Notifications</span>
                            </>
                          )}
                        </button>

                        <div className="h-px bg-divider my-1" />

                        {/* Option 3: Clear Chat History */}
                        <button
                          type="button"
                          onClick={() => {
                            setOptionsMenuOpen(false);
                            setShowClearModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
                        >
                          <Eraser size={14} />
                          <span>Clear Chat History</span>
                        </button>

                        {/* Option 4: Delete Conversation */}
                        <button
                          type="button"
                          onClick={() => {
                            setOptionsMenuOpen(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                        >
                          <Trash2 size={14} />
                          <span>Delete Conversation</span>
                        </button>

                        <div className="h-px bg-divider my-1" />

                        {/* Option 5: Safety / Report */}
                        <button
                          type="button"
                          onClick={() => {
                            setOptionsMenuOpen(false);
                            toast.success("Trust & Safety report logged. Support will review.");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer text-left"
                        >
                          <ShieldAlert size={14} />
                          <span>Report Inappropriate Content</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= BOOKING CONTEXT BANNER ================= */}
              <div className="bg-app/40 border-b border-divider px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {activeConv.itemImage ? (
                    <img
                      src={activeConv.itemImage}
                      alt={activeConv.itemTitle}
                      className="size-9 rounded-xl object-cover border border-divider shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="size-9 rounded-xl bg-surface border border-divider flex items-center justify-center shrink-0 text-primary">
                      <Package size={16} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary truncate">{activeConv.itemTitle}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          activeConv.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : activeConv.status === "ongoing"
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : activeConv.status === "completed"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "bg-surface text-text-muted border border-divider"
                        }`}
                      >
                        {activeConv.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary">
                      <span>Total Rent: ₹{activeConv.totalAmount?.toLocaleString("en-IN")}</span>
                      {activeConv.securityDeposit > 0 && (
                        <span className="text-emerald-400 font-semibold">
                          {" "}
                          • Escrow: ₹{activeConv.securityDeposit?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="flex items-center gap-2 ml-auto">
                  <Link
                    to={isOwner ? "/bookings" : `/rentals/${activeConv.id}`}
                    className="px-3 py-1.5 rounded-xl bg-surface hover:bg-white/10 border border-divider text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>{isOwner ? "Manage in Bookings" : "View Rental Details"}</span>
                    <ArrowUpRight size={13} className="text-primary" />
                  </Link>
                </div>
              </div>

              {/* ================= CHAT THREAD FEED ================= */}
              <div
                ref={chatFeedRef}
                className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar bg-radial from-app/20 to-surface"
              >
                {/* Date / Security Disclaimer */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app/80 border border-divider text-[10px] text-text-muted font-medium shadow-inner">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>Protected by Rentora Escrow • Chat logged for dispute protection</span>
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="flex items-center justify-center py-16 text-text-muted text-xs font-medium gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === user?.id || msg.senderId === user?._id;
                    const msgId = msg.id || msg._id || index;
                    const isCopied = copiedMsgId === msgId;

                    return (
                      <div
                        key={msgId}
                        className={`group relative flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        } animate-in fade-in slide-in-from-bottom-2 duration-150`}
                      >
                        <div
                          className={`relative max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm transition-all ${
                            isMe
                              ? "bg-primary text-text-primary font-medium rounded-tr-none"
                              : "bg-app border border-divider text-text-primary rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                          {/* Quick Message Actions (Hover Tooltip Bar) */}
                          <div
                            className={`absolute top-1 ${
                              isMe ? "-left-16" : "-right-16"
                            } hidden group-hover:flex items-center gap-1 bg-surface border border-divider rounded-lg p-1 shadow-lg z-10`}
                          >
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msgId, msg.text)}
                              title="Copy text"
                              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/10 cursor-pointer"
                            >
                              {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>

                            {isMe && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msgId)}
                                title="Delete message"
                                className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Timestamp & Status */}
                        <div className="flex items-center gap-1 text-[9px] text-text-muted mt-1 px-1">
                          <span>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && <CheckCheck size={12} className="text-primary" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 text-text-muted space-y-3">
                    <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
                      <Sparkles size={22} className="animate-pulse" />
                    </div>
                    <p className="text-xs font-bold text-text-primary">Start the conversation</p>
                    <p className="text-[11px] max-w-xs mx-auto text-text-secondary leading-relaxed">
                      Coordinate handover timing, verify equipment accessories, and ask any questions before pickup.
                    </p>
                  </div>
                )}
              </div>

              {/* ================= SMART QUICK REPLY CHIPS ================= */}
              {showQuickChips && (
                <div className="px-4 py-2 border-t border-divider/60 bg-app/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles size={11} className="text-primary" />
                    <span>Quick:</span>
                  </span>
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(action.text)}
                      className="px-2.5 py-1 rounded-lg bg-surface hover:bg-white/10 border border-divider text-[11px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0 shadow-sm active:scale-95"
                    >
                      {action.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowQuickChips(false)}
                    className="ml-auto text-text-muted hover:text-text-primary text-[10px] shrink-0 p-1"
                    title="Hide suggestions"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* ================= MESSAGE COMPOSER ================= */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3.5 sm:p-4 border-t border-divider flex items-center gap-2 sm:gap-3 bg-app/20"
              >
                {/* Simulated File Attachment */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSendMessage(`📸 Shared Equipment Photo: ${file.name}`);
                      toast.success(`Photo attached: ${file.name}`);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach equipment inspection photo"
                  className="p-2.5 rounded-xl bg-app hover:bg-white/10 border border-divider text-text-muted hover:text-text-primary transition-colors cursor-pointer shadow-inner active:scale-95"
                >
                  <Paperclip size={15} />
                </button>

                {/* Input Text Box */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${activeConv.partnerName}... (Press Enter to send)`}
                  className="flex-1 bg-app border border-divider rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors shadow-inner"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-primary text-text-primary font-semibold px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shadow-md text-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="size-16 rounded-3xl bg-app border border-divider flex items-center justify-center text-text-muted/60 shadow-inner">
                <MessageSquare className="size-8 text-primary" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Select a Conversation</h3>
              <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
                Choose a booking from the left inquiry list to coordinate pickup, verify equipment conditions, and
                exchange PINs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: CLEAR CHAT CONFIRMATION ================= */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-surface border border-divider p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Eraser size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Clear Chat History?</h3>
                <p className="text-xs text-text-secondary">
                  This will delete all messages for {activeConv?.itemTitle}. Your booking and escrow remain unchanged.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-divider">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONVERSATION CONFIRMATION ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-surface border border-divider p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Delete Conversation?</h3>
                <p className="text-xs text-text-secondary">
                  Are you sure you want to delete this chat with {activeConv?.partnerName}? All chat logs will be
                  removed from your active list.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-divider">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConversation(activeConvId)}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-text-primary text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
