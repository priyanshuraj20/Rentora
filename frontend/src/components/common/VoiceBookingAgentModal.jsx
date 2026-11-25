import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Mic,
  Sparkles,
  Volume2,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Send,
  Lock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/authHook";
import { useNavigate } from "react-router-dom";

export default function VoiceBookingAgentModal({ open, onClose, onOpenAuth }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    return new Date(Date.now() + 86400000).toISOString().split("T")[0];
  });
  const [selectedDays, setSelectedDays] = useState(2);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const isRenter = user && (user.role === "renter" || (Array.isArray(user.role) && user.role.includes("renter")) || user.roles === "renter");

  useEffect(() => {
    if (!open) {
      stopRecordingCleanup();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingAudio(false);
      setIsLoading(false);
      setShowAuthPrompt(false);
    } else {
      setResult(null);
      setTextInput("");
      setShowAuthPrompt(false);
      setSelectedDays(2);
      setSelectedStartDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);

      // If user is guest / not logged in, play the gated audio explanation
      if (!isRenter) {
        playGatedAudio();
      }
    }
  }, [open, isRenter]);

  const playGatedAudio = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const baseUrl = backendUrl.endsWith("/api/v1") ? backendUrl : `${backendUrl}/api/v1`;
      const lang = localStorage.getItem("rentora_voice_lang") || "hi-IN";

      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = `${baseUrl}/voice/dashboard-guide?role=gated&lang=${lang}`;

      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
      audioPlayerRef.current.onerror = () => setIsPlayingAudio(false);

      audioPlayerRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => {});
    } catch (_) {}
  };

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
  };

  // Start native browser microphone recording
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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        await submitVoiceRequest(audioBlob, null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => {
          if (prev >= 5) {
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            return 6;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn("Microphone access blocked:", err);
      toast.error("Microphone access denied. You can type your request or click sample chips below.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // Submit voice audio blob or text query to backend agent
  const submitVoiceRequest = async (audioBlob, text) => {
    setIsLoading(true);
    setResult(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const baseUrl = backendUrl.endsWith("/api/v1") ? backendUrl : `${backendUrl}/api/v1`;
    const agentEndpoint = `${baseUrl}/voice/agent`;

    try {
      let response;

      if (audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob, "user_request.webm");
        formData.append("lang", localStorage.getItem("rentora_voice_lang") || "hi-IN");

        response = await fetch(agentEndpoint, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(agentEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: text,
            lang: localStorage.getItem("rentora_voice_lang") || "hi-IN",
          }),
        });
      }

      const data = await response.json();

      if (data.success && data.bookingCard) {
        setResult(data);
        if (data.bookingCard.startDateRaw) {
          setSelectedStartDate(data.bookingCard.startDateRaw);
        }
        if (data.bookingCard.totalDays) {
          setSelectedDays(data.bookingCard.totalDays);
        }
        setShowAuthPrompt(false);

        if (data.audioBase64) {
          playAgentAudio(data.audioBase64);
        }
        toast.success("✨ Gear matched & booking card prepared!");
      } else {
        toast.error(data.message || "Could not match gear for this request. Please try again.");
      }
    } catch (err) {
      console.error("Voice agent request error:", err);
      toast.error("Failed to connect to Voice Booking Agent.");
    } finally {
      setIsLoading(false);
    }
  };

  const playAgentAudio = (base64) => {
    try {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = `data:audio/wav;base64,${base64}`;

      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
      audioPlayerRef.current.onerror = () => setIsPlayingAudio(false);

      audioPlayerRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => console.warn("Auto-play error:", e));
    } catch (_) {}
  };

  const handleSampleChipClick = (query) => {
    setTextInput(query);
    submitVoiceRequest(null, query);
  };

  const handleTextSubmit = (e) => {
    e?.preventDefault();
    if (!textInput.trim()) return;
    submitVoiceRequest(null, textInput.trim());
  };

  // Check if current user is demo or unauthenticated
  const isDemoUser = user && (user.email?.includes("demo@rentora.com") || user.name?.includes("Demo"));

  // 1-Click Proceed to Razorpay Checkout
  const handleProceedToCheckout = (itemId) => {
    if (!user || isDemoUser) {
      setShowAuthPrompt(true);
    } else {
      goToCheckout(itemId);
    }
  };

  const goToCheckout = (itemId) => {
    onClose();
    const startObj = new Date(selectedStartDate);
    const endObj = new Date(startObj.getTime() + selectedDays * 24 * 60 * 60 * 1000);
    const endStr = !isNaN(endObj.getTime()) ? endObj.toISOString().split("T")[0] : "";
    navigate(`/renter/rent/${itemId}?start=${selectedStartDate}&end=${endStr}&days=${selectedDays}`);
  };

  // 1-Click Unlock for Guests
  const handleUnlockAsDemoRenter = async () => {
    toast("Unlocking Voice Booking Agent...", { icon: "🔓" });
    const res = await demoLogin("renter");
    if (res.success) {
      toast.success("Logged in as Demo Renter! You can now speak to book.");
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_150ms_ease-out]">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-primary/30 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-app border border-divider text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            <span>Autonomous Voice-to-Booking Agent</span>
          </div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            {!isRenter ? "Exclusive Renter AI Feature" : "Speak to Rent Anything in Seconds"}
          </h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {!isRenter
              ? "This autonomous voice booking feature is built exclusively for Renters on Rentora."
              : "Speak naturally in Hinglish, Hindi, or English. Our AI searches active inventory, checks availability, and builds your booking card."}
          </p>
        </div>

        {/* ================= GUEST GATED SCREEN (NOT LOGGED IN AS RENTER) ================= */}
        {!isRenter && (
          <div className="space-y-4 animate-[fadeIn_200ms_ease-out]">
            {/* Audio Voice Explanation Banner */}
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/25 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Volume2 size={12} className={isPlayingAudio ? "animate-pulse" : ""} />
                  <span>AI Voice Explanation (Sarvam Bulbul)</span>
                </span>
                <span className="text-[10px] text-text-muted bg-app px-2 py-0.5 rounded">
                  {isPlayingAudio ? "Speaking..." : "Audio Ready"}
                </span>
              </div>
              <p className="text-xs text-text-primary italic leading-relaxed">
                "नमस्ते! यह Autonomous Voice Agent केवल रेंटर्स के लिए है। यहाँ आप बिना टाइप किए सिर्फ़ बोलकर कैमरा, ड्रोन या टूल्स सर्च कर सकते हैं और 1-Click में बुक कर सकते हैं। कृपया रेंटर के रूप में लॉगिन करें!"
              </p>
            </div>

            {/* Feature Capabilities Breakdown */}
            <div className="rounded-2xl bg-app border border-divider p-4 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                What this Voice Agent does for you:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Mic size={12} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Speak in Hinglish, Hindi or English</p>
                    <p className="text-[11px] text-text-muted">Say <i>"Sony camera chahiye weekend ke liye"</i> without filling forms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={12} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Instant Inventory & Date Verification</p>
                    <p className="text-[11px] text-text-muted">Autonomous multi-tool agent matches gear and validates open dates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={12} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Automated Escrow & 1-Click Razorpay</p>
                    <p className="text-[11px] text-text-muted">Pre-calculates rent + deposit and generates your instant booking card.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unlock Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleUnlockAsDemoRenter}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Zap size={14} />
                <span>⚡ 1-Click Demo Login as Renter & Unlock Mic</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth?.("login");
                }}
                className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-divider text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Login with Existing Account / Register
              </button>
            </div>
          </div>
        )}

        {/* ================= STATE 1: RECORDING / LISTENING (LOGGED IN AS RENTER) ================= */}
        {isRenter && !result && !isLoading && (
          <div className="space-y-5">
            {/* Pulsing Mic Circle */}
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="relative">
                {isRecording && (
                  <>
                    <span className="absolute -inset-3 rounded-full bg-primary/20 animate-ping opacity-75" />
                    <span className="absolute -inset-6 rounded-full bg-primary/10 animate-pulse opacity-50" />
                  </>
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                    isRecording
                      ? "bg-red-500 text-white shadow-red-500/30 scale-105"
                      : "bg-primary hover:bg-primary-hover text-text-primary shadow-primary/30 active:scale-95"
                  }`}
                >
                  <Mic size={32} className={isRecording ? "animate-pulse" : ""} />
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-text-primary">
                  {isRecording ? `Listening... (${recordTimer}s / 6s)` : "Tap Mic & Speak"}
                </p>
                <p className="text-[11px] text-text-muted">
                  {isRecording ? "Click again when done speaking" : "Or choose a sample query below"}
                </p>
              </div>
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted text-center">
                Try Saying or Tap to Test:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Sony camera Indiranagar mein", query: "Bhai Sony camera chahiye weekend ke liye Indiranagar mein", icon: "📸" },
                  { label: "DJI 4K drone 2 din ke liye", query: "DJI drone rent pe chahiye 2 din ke liye", icon: "🚁" },
                  { label: "DeWalt hammer drill 1 din", query: "DeWalt hammer drill chahiye 1 din ke liye", icon: "🔨" },
                  { label: "Royal Enfield bike Bandra mein", query: "Royal Enfield bike chahiye Bandra mein", icon: "🏍️" },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSampleChipClick(chip.query)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-app hover:bg-white/5 border border-divider text-left text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer group"
                  >
                    <span className="text-base">{chip.icon}</span>
                    <span className="line-clamp-1 font-medium group-hover:text-primary transition-colors">
                      {chip.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Text Fallback */}
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2 pt-1 border-t border-divider/50">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type: e.g. 'Sony camera for 2 days'..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-app border border-divider focus:border-primary text-xs text-text-primary focus:outline-none transition-all placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-text-primary text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        )}

        {/* ================= STATE 2: THINKING & MATCHING ================= */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-primary/20 animate-ping" />
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <RefreshCw size={26} className="animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary">
                Autonomous Agent is Working...
              </p>
              <p className="text-xs text-text-muted max-w-xs">
                Transcribing via Sarvam AI, querying live inventory, checking calendar availability, and preparing escrow breakdown.
              </p>
            </div>
          </div>
        )}

        {/* ================= STATE 3: PRE-FILLED BOOKING CARD ================= */}
        {result && result.bookingCard && (
          <div className="space-y-4 animate-[fadeIn_200ms_ease-out]">
            {/* AI Spoken Voice Response Banner */}
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/25 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> AI Voice Response (Sarvam Bulbul)
                </span>
                {result.audioBase64 && (
                  <button
                    onClick={() => playAgentAudio(result.audioBase64)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    <Volume2 size={12} className={isPlayingAudio ? "animate-pulse" : ""} />
                    <span>{isPlayingAudio ? "Playing..." : "Replay Voice"}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-text-primary leading-relaxed italic">
                "{result.spokenResponse}"
              </p>
            </div>

            {/* Structured Pre-filled Booking Card */}
            <div className="rounded-2xl bg-app border border-divider p-4 space-y-3.5">
              <div className="flex gap-3.5 items-center">
                <img
                  src={result.bookingCard.image}
                  alt={result.bookingCard.title}
                  className="w-16 h-16 rounded-xl object-cover border border-divider shadow-inner flex-shrink-0"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface px-2 py-0.5 rounded border border-divider">
                    {result.bookingCard.category}
                  </span>
                  <h3 className="text-sm font-bold text-text-primary truncate">
                    {result.bookingCard.title}
                  </h3>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <MapPin size={11} className="text-primary flex-shrink-0" />
                    <span className="truncate">{result.bookingCard.locality}</span>
                  </p>
                </div>
              </div>

              {/* Interactive Dates & Duration Selection */}
              <div className="p-3 rounded-2xl bg-surface border border-divider/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-secondary flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    <span>Select Start Date:</span>
                  </span>
                  <input
                    type="date"
                    value={selectedStartDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedStartDate(e.target.value)}
                    className="bg-app border border-divider rounded-xl px-2.5 py-1 text-xs text-text-primary focus:border-primary focus:outline-none cursor-pointer font-semibold"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-secondary flex items-center gap-1.5">
                    <Zap size={13} className="text-primary" />
                    <span>Rental Duration:</span>
                  </span>
                  <div className="flex items-center gap-1.5 bg-app border border-divider px-1.5 py-0.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectedDays((prev) => Math.max(1, prev - 1))}
                      className="h-6 w-6 rounded-lg bg-surface hover:bg-white/10 text-xs flex items-center justify-center font-bold text-text-primary cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-primary px-2">
                      {selectedDays} {selectedDays === 1 ? "Day" : "Days"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDays((prev) => prev + 1)}
                      className="h-6 w-6 rounded-lg bg-surface hover:bg-white/10 text-xs flex items-center justify-center font-bold text-text-primary cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[1, 2, 3, 5, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDays(d)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        selectedDays === d
                          ? "bg-primary text-text-primary border-primary shadow-sm"
                          : "bg-app hover:bg-white/5 border-divider text-text-muted"
                      }`}
                    >
                      {d === 7 ? "1 Week" : `${d}D`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Escrow Pricing Breakdown (Dynamically Recalculated) */}
              <div className="space-y-1.5 pt-1 border-t border-divider/60 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Rental (₹{result.bookingCard.pricing.dailyPrice}/day × {selectedDays}d)</span>
                  <span className="font-semibold text-text-primary">
                    ₹{(result.bookingCard.pricing.dailyPrice * selectedDays).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>Refundable Deposit (Escrow Locked)</span>
                  </span>
                  <span className="font-semibold text-emerald-400">
                    ₹{result.bookingCard.pricing.securityDeposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-text-primary pt-1.5 border-t border-divider/60">
                  <span>Total Escrow Amount:</span>
                  <span className="text-primary font-black">
                    ₹{((result.bookingCard.pricing.dailyPrice * selectedDays) + result.bookingCard.pricing.securityDeposit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Auth / Demo Mode Prompt if user clicked proceed while in demo or guest mode */}
            {showAuthPrompt && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-[fadeIn_150ms_ease-out]">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Lock size={14} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-300">
                      {!user ? "Login Required for Real Escrow Booking" : "Demo Account Detected"}
                    </h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {!user
                        ? "Real booking ke liye apna personal account login ya register karein."
                        : `Aap Demo Renter (${user.name || user.email}) ke roop mein logged in hain. Real Razorpay payment ke liye Register / Login karein, ya demo checkout test karne ke liye continue karein.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth?.("register");
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    🔐 Register / Login
                  </button>
                  <button
                    type="button"
                    onClick={() => goToCheckout(result.bookingCard.itemId)}
                    className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-white/10 border border-divider text-text-secondary hover:text-text-primary text-xs font-semibold transition-all cursor-pointer"
                  >
                    ⚡ Continue as Demo
                  </button>
                </div>
              </div>
            )}

            {/* Direct Proceed to Razorpay Checkout Button */}
            {!showAuthPrompt && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleProceedToCheckout(result.bookingCard.itemId)}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>⚡ Proceed to Instant Razorpay Checkout</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="w-full py-2 rounded-xl text-text-muted hover:text-text-primary text-xs font-medium transition-colors cursor-pointer"
                >
                  Search Another Item
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
