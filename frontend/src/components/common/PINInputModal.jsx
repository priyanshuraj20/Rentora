import React, { useState, useRef, useEffect } from "react";
import { X, ShieldCheck, ArrowRight, RefreshCw, Sparkles, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../utils/apiClient";

export default function PINInputModal({
  open,
  onClose,
  bookingId,
  type = "handover", // "handover" | "return"
  title,
  onSuccess,
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const modalTitle =
    title ||
    (type === "handover"
      ? "Enter Handover PIN"
      : "Enter Return PIN");

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleDigitChange = (index, value) => {
    // Only allow single numeric or alphanumeric character
    const char = value.slice(-1).toUpperCase();
    if (value && !/^[0-9A-Z]$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6).toUpperCase();
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const pin = digits.join("");
    if (pin.length !== 6) {
      toast.error("Please enter the complete 6-digit PIN");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/verify-pin`,
        {
          method: "POST",
          body: JSON.stringify({ type, pin }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Invalid or expired PIN. Please enter the fresh PIN.");
        setLoading(false);
        return;
      }

      toast.success(
        type === "handover"
          ? "Handover verified! Booking is now ONGOING. 🎉"
          : "Return verified! Booking completed & Escrow refunded. 🎉"
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err.message || "Failed to verify PIN");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
              ? "Enter the 6-digit dynamic PIN shown on the Renter's screen to verify handover."
              : "Enter the 6-digit dynamic PIN shown on the Owner's screen to complete return."}
          </p>
        </div>

        {/* 6-Box PIN Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            className="flex items-center justify-center gap-2 sm:gap-2.5"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 sm:w-12 h-14 sm:h-16 rounded-xl bg-app border-2 border-divider focus:border-primary text-center text-2xl font-mono font-bold text-text-primary focus:outline-none transition-all shadow-inner"
              />
            ))}
          </div>

          <p className="text-[11px] text-center text-text-muted">
            The code auto-rotates every 15 seconds. Please enter the live PIN displayed on screen.
          </p>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading || digits.join("").length !== 6}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <span>
                    {type === "handover"
                      ? "Verify Handover & Start Rental"
                      : "Verify Return & Refund Escrow"}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-text-muted hover:text-text-primary text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
