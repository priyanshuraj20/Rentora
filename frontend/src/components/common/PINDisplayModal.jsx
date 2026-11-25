import React, { useState, useEffect } from "react";
import { X, KeyRound, Copy, Check, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../utils/apiClient";

export default function PINDisplayModal({
  open,
  onClose,
  bookingId,
  type = "handover", // "handover" | "return"
  title,
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const modalTitle =
    title ||
    (type === "handover"
      ? "Handover Verification PIN"
      : "Return Verification PIN");

  const fetchOrGeneratePin = async () => {
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
      if (data.success && data.data?.pin) {
        setPin(data.data.pin);
      } else {
        toast.error(data.message || "Failed to generate verification PIN");
      }
    } catch (err) {
      console.error("PIN generation error:", err);
      toast.error(err.message || "Error generating PIN");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchOrGeneratePin();
    } else {
      setPin("");
      setCopied(false);
    }
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
              ? "Share this 6-digit PIN with the other party at physical pickup to authorize the rental."
              : "Share this 6-digit PIN upon item return to authorize booking completion."}
          </p>
        </div>

        {/* PIN Display Cards */}
        <div className="bg-app border border-divider/80 rounded-2xl p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-text-muted text-sm">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <span>Generating secure code...</span>
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

          {!loading && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
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
                onClick={fetchOrGeneratePin}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-divider hover:border-primary/40 text-xs font-semibold text-text-muted hover:text-text-primary transition-all cursor-pointer active:scale-95"
                title="Regenerate PIN"
              >
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted">
          <ShieldCheck size={14} className="text-success" />
          <span>Uber-style mutual verification • 1-hour expiration</span>
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
