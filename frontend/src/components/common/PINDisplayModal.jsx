import React, { useState, useEffect, useRef } from "react";
import { X, KeyRound, Copy, Check, RefreshCw, ShieldCheck, Sparkles, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../utils/apiClient";
import { useSocket } from "../../context/SocketContext";

export default function PINDisplayModal({
  open,
  onClose,
  onCompleted,
  bookingId,
  type = "handover", // "handover" | "return"
  title,
}) {
  const { socket } = useSocket() || {};
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const modalTitle =
    title ||
    (type === "handover"
      ? "My Secret Handover PIN"
      : "My Secret Return PIN");

  const fetchOrGeneratePin = async (showToast = false) => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/generate-pin`,
        {
          method: "POST",
          body: JSON.stringify({ type }),
        }
      );
      const data = await res.json();
      if (res.status === 409 || data.message?.toLowerCase().includes("already been")) {
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success(
          type === "handover"
            ? "Handover verified! Rental is now ONGOING."
            : "Return verified! Rental is now COMPLETED."
        );
        onCompleted?.();
        onClose();
        return;
      }
      if (data.success && data.data?.pin) {
        setPin(data.data.pin);
        setTimeLeft(15);
        if (showToast) {
          toast.success("Fresh 15-second PIN generated!");
        }
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        toast.error(data.message || "Failed to generate verification PIN");
        onClose();
      }
    } catch (err) {
      console.error("PIN generation error:", err);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.error(err.message || "Error generating PIN");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Real-time Socket.io listener: close modal immediately when the other party verifies PIN
  useEffect(() => {
    if (!open || !socket || !bookingId) return;

    const handleBookingUpdated = (data) => {
      if (data?.bookingId !== bookingId) return;
      if (
        (type === "handover" && data.status === "ongoing") ||
        (type === "return" && data.status === "completed")
      ) {
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success(
          type === "handover"
            ? "Handover verified by Owner! Rental is now ONGOING. 🎉"
            : "Return verified! Rental completed & deposit settlement triggered. 🎉"
        );
        onCompleted?.();
        onClose();
      }
    };

    socket.on("booking_updated", handleBookingUpdated);
    return () => {
      socket.off("booking_updated", handleBookingUpdated);
    };
  }, [open, socket, bookingId, type]);

  // Open modal -> generate first PIN and start 15s rotating countdown
  useEffect(() => {
    if (open) {
      fetchOrGeneratePin(false);
    } else {
      setPin("");
      setCopied(false);
      setTimeLeft(15);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open, bookingId, type]);

  // 15-second automatic rotation timer
  useEffect(() => {
    if (!open) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired -> trigger auto-rotation
          fetchOrGeneratePin(false);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, bookingId, type]);

  const handleCopy = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopied(true);
    toast.success("PIN copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  const pinDigits = pin ? pin.split("") : ["-", "-", "-", "-", "-", "-"];
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 15) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-[fadeIn_150ms_ease-out]">
      <div className="relative w-full max-w-md rounded-3xl bg-surface border border-divider p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-app border border-divider text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary items-center justify-center shadow-inner">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            {modalTitle}
          </h2>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            {type === "handover"
              ? "Tell or show this 6-digit PIN to the Owner when collecting your item in person."
              : "Inspect the returned item, then tell this 6-digit PIN to the Renter so they can complete the return."}
          </p>
        </div>

        {/* PIN Display Cards */}
        <div className="bg-app border border-divider/80 rounded-2xl p-6 text-center space-y-4 shadow-inner">
          {/* Live Indicator & Timer Badge */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dynamic Rotating Code</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-text-muted bg-surface px-2 py-0.5 rounded-md border border-divider">
              <Clock size={12} className="text-primary" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* 15s Progress Bar */}
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-divider/50">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft <= 3 ? "bg-red-500" : timeLeft <= 7 ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 6 Digit Boxes */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-text-muted text-sm font-medium">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <span>Rotating secure PIN...</span>
              </div>
            ) : (
              pinDigits.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-10 sm:w-12 h-14 sm:h-16 rounded-xl bg-surface border-2 border-primary/40 flex items-center justify-center text-2xl sm:text-3xl font-extrabold font-mono text-primary shadow-md tracking-wider select-all"
                >
                  {digit}
                </div>
              ))
            )}
          </div>

          {/* Subtext info */}
          <p className="text-[11px] text-text-muted">
            Code auto-refreshes every 15s for anti-theft & screenshot protection.
          </p>

          {/* Actions */}
          {!loading && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-divider hover:border-primary/40 text-xs font-semibold text-text-primary transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-success" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-text-muted" />
                    <span>Copy PIN</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => fetchOrGeneratePin(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-divider hover:border-primary/40 text-xs font-semibold text-text-muted hover:text-text-primary transition-all cursor-pointer active:scale-95"
                title="Force refresh new PIN"
              >
                <RefreshCw size={13} />
                <span>Refresh Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted">
          <ShieldCheck size={14} className="text-success" />
          <span>Dynamic TOTP Security • Valid in-person only</span>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-semibold transition-all shadow-md cursor-pointer active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  );
}
