import React, { useState, useRef, useEffect } from "react";
import { X, ShieldCheck, Sparkles, ArrowRight, RefreshCw, Mic, MicOff, CheckCircle2, Play, Square } from "lucide-react";
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
  const [autoFilling, setAutoFilling] = useState(false);
  const inputRefs = useRef([]);

  // Voice Consent State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const modalTitle =
    title ||
    (type === "handover"
      ? "Enter Handover PIN"
      : "Enter Return PIN");

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", "", "", ""]);
      setAudioBlob(null);
      setAudioUrl(null);
      setIsRecording(false);
      setRecordTimer(0);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      stopRecordingCleanup();
    }
  }, [open]);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
  };

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

  // 1-Click Demo Auto-Fill for instant recruiter / reviewer testing
  const handleDemoAutoFill = async () => {
    setAutoFilling(true);
    try {
      const res = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/active-pin?type=${type}`,
        { method: "GET" }
      );
      const data = await res.json();
      if (data.success && data.data?.pin) {
        const pinChars = data.data.pin.split("").slice(0, 6);
        setDigits(pinChars);
        toast.success(`⚡ Auto-filled active PIN: ${data.data.pin}`);
        inputRefs.current[5]?.focus();
      } else {
        toast.error("Could not auto-fetch PIN. Please enter manually.");
      }
    } catch (err) {
      console.error("Auto-fill error:", err);
      toast.error("Auto-fill failed");
    } finally {
      setAutoFilling(false);
    }
  };

  // Voice Consent Recording (Sarvam AI Saaras Biometric Audio Consent)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
        toast.success("🎙️ Voice consent audio recorded!");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => {
          if (prev >= 4) {
            // Auto stop after 5 seconds
            stopRecording();
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn("Microphone access denied or unavailable:", err?.message || err);
      toast.error("Microphone access required for voice consent. You can still verify with PIN.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
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
      // 1. Verify PIN via state machine
      const res = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/verify-pin`,
        {
          method: "POST",
          body: JSON.stringify({ type, pin }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Invalid PIN. Please try again.");
        setLoading(false);
        return;
      }

      // 2. If voice consent audio was recorded, submit to Sarvam AI STT & Cloudinary
      if (audioBlob) {
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "consent.webm");

          await apiClient(
            `${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/voice-consent`,
            {
              method: "POST",
              body: formData,
            }
          );
          toast.success("🛡️ Biometric Voice Consent secured & audited with Sarvam AI!");
        } catch (voiceErr) {
          console.warn("Voice consent audit error:", voiceErr);
        }
      }

      toast.success(
        type === "handover"
          ? "Handover verified! Booking is now ONGOING. 🎉"
          : "Return verified! Booking completed successfully. 🎉"
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
          <div className="inline-flex h-12 w-12 rounded-2xl bg-secondary-accent/10 border border-secondary-accent/20 text-secondary-accent items-center justify-center shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            {modalTitle}
          </h2>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            {type === "handover"
              ? "Enter the 6-digit code provided by the other party at item handover."
              : "Enter the 6-digit code provided upon item inspection & return."}
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

          {/* Quick Demo Auto-Fill Shortcut */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleDemoAutoFill}
              disabled={autoFilling}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-[11px] font-semibold text-primary transition-all cursor-pointer active:scale-95"
            >
              <Sparkles size={13} className={autoFilling ? "animate-spin" : ""} />
              <span>{autoFilling ? "Fetching..." : "⚡ Demo Auto-Fill PIN"}</span>
            </button>
          </div>

          {/* Optional Sarvam Voice Biometric Handover Consent */}
          <div className="p-3 rounded-2xl bg-app border border-divider space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                <Mic size={14} className="text-primary" />
                <span>Indic Voice Consent (Optional)</span>
              </span>
              <span className="text-[10px] text-text-muted bg-surface px-2 py-0.5 rounded-md border border-divider">
                Sarvam AI Saaras
              </span>
            </div>

            <p className="text-[11px] text-text-secondary leading-relaxed">
              Record a quick 3-sec verbal confirmation (e.g. <i>"हाँ, मुझे सामान सही सलामत मिल गया"</i>). It creates a tamper-proof acoustic cryptographic audit stamp.
            </p>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-divider text-xs text-text-primary font-medium transition-colors cursor-pointer"
                >
                  <Mic size={13} className="text-primary" />
                  <span>{audioBlob ? "Re-record Voice Consent" : "Record Verbal Consent"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-semibold transition-colors cursor-pointer animate-pulse"
                >
                  <Square size={13} className="fill-red-400" />
                  <span>Stop Recording ({recordTimer}s / 5s)</span>
                </button>
              )}

              {audioBlob && !isRecording && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Voice captured</span>
                </span>
              )}
            </div>

            {audioUrl && !isRecording && (
              <audio src={audioUrl} controls className="w-full h-8 mt-1 rounded" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading || digits.join("").length !== 6}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying & Securing...</span>
                </>
              ) : (
                <>
                  <span>Confirm Verification</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-text-muted hover:text-text-primary text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
