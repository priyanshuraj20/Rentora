import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Mic,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Send,
  Zap,
  Lock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/authHook";
import { useNavigate } from "react-router-dom";

export default function VoiceBookingAgentModal({ open, onClose, onOpenAuth }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isRenter =
    user &&
    (user.role === "renter" ||
      (Array.isArray(user.role) && user.role.includes("renter")) ||
      user.roles === "renter");

  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    return new Date(Date.now() + 86400000).toISOString().split("T")[0];
  });
  const [selectedDays, setSelectedDays] = useState(2);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!open) {
      stopRecordingCleanup();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingAudio(false);
      setIsLoading(false);
    } else {
      setResult(null);
      setErrorMessage("");
      setTextInput("");
      setLiveTranscript("");
      setSelectedDays(2);
      setSelectedStartDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    }
  }, [open]);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
  };

  // Start microphone speech capture
  const startRecording = () => {
    setErrorMessage("");
    setLiveTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = localStorage.getItem("rentora_voice_lang") || "hi-IN";
        recognition.interimResults = true;
        recognition.continuous = false;

        let finalCaptured = "";

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalCaptured += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const current = finalCaptured || interim;
          setLiveTranscript(current);
          setTextInput(current);
        };

        recognition.onerror = (event) => {
          setIsRecording(false);
          if (event.error === "no-speech") {
            toast.error("No speech detected. Please speak into the mic or choose a sample.");
          } else if (event.error === "not-allowed") {
            toast.error("Microphone access denied. Please allow microphone permissions in browser.");
          } else {
            console.warn("Speech recognition error:", event.error);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          const finalQuery = (finalCaptured || textInput || liveTranscript || "").trim();
          if (finalQuery) {
            submitVoiceRequest(null, finalQuery);
          }
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn("SpeechRecognition failed, falling back to MediaRecorder", e);
      }
    }

    // Fallback: MediaRecorder audio stream
    startMediaRecorderFallback();
  };

  const startMediaRecorderFallback = async () => {
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
      toast.error("Microphone access unavailable. You can type your request or tap a sample below.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
  };

  // Submit voice request (audio or query text) to backend
  const submitVoiceRequest = async (audioBlob, text) => {
    setIsLoading(true);
    setResult(null);
    setErrorMessage("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const baseUrl = backendUrl.endsWith("/api/v1") ? backendUrl : `${backendUrl}/api/v1`;
    const agentEndpoint = `${baseUrl}/voice/agent`;

    try {
      let response;

      if (audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob, "user_request.webm");
        formData.append("lang", localStorage.getItem("rentora_voice_lang") || "en-IN");

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
            lang: localStorage.getItem("rentora_voice_lang") || "en-IN",
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

        if (data.audioBase64) {
          playAgentAudio(data.audioBase64);
        }
        toast.success(`Found ${data.bookingCard.title}!`);
      } else {
        const msg = data.message || "Could not find gear matching your request. Try another query.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Voice agent request error:", err);
      setErrorMessage("Could not reach Voice Booking. Please check your connection and try again.");
      toast.error("Could not reach Voice Booking. Please try again.");
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
    setLiveTranscript(query);
    submitVoiceRequest(null, query);
  };

  const handleTextSubmit = (e) => {
    e?.preventDefault();
    if (!textInput.trim()) return;
    submitVoiceRequest(null, textInput.trim());
  };

  const goToCheckout = (itemId) => {
    onClose();
    const startObj = new Date(selectedStartDate);
    const endObj = new Date(startObj.getTime() + selectedDays * 24 * 60 * 60 * 1000);
    const endStr = !isNaN(endObj.getTime()) ? endObj.toISOString().split("T")[0] : "";
    navigate(`/renter/rent/${itemId}?start=${selectedStartDate}&end=${endStr}&days=${selectedDays}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_150ms_ease-out]">
      <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-emerald-500/30 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-app border border-divider text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Mic size={13} />
            <span>Voice Booking</span>
          </div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Find Equipment by Voice
          </h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            Speak naturally in Hindi, Hinglish, or English to find verified cameras, drones, tools, or bikes nearby.
          </p>
        </div>

        {/* ================= CONDITION 1: USER NOT LOGGED IN AS RENTER ================= */}
        {!user ? (
          <div className="space-y-6 py-4 text-center">
            <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock size={28} />
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-text-primary">
                Sign In as Renter to Use Voice Booking
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Voice Booking is an exclusive feature for verified Renters. Please sign in or create an
                account to search and book equipment by voice in seconds.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 max-w-xs mx-auto">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth?.("login");
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
              >
                <span>Sign In as Renter</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAuth?.("register");
                }}
                className="w-full py-2.5 px-6 rounded-xl bg-app hover:bg-white/5 border border-divider text-text-secondary hover:text-text-primary font-semibold text-xs transition-all cursor-pointer"
              >
                Create New Renter Account
              </button>
            </div>
          </div>
        ) : !isRenter ? (
          /* User is logged in, but not as a Renter */
          <div className="space-y-6 py-4 text-center">
            <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-text-primary">
                Renter Account Required
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                You are currently signed in with an Owner profile. Voice Booking is an equipment rental
                feature built for Renters. Please switch to a Renter account to book gear.
              </p>
            </div>

            <div className="pt-2 max-w-xs mx-auto">
              <button
                onClick={() => {
                  onClose();
                  navigate("/role-redirect");
                }}
                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Switch to Renter Profile
              </button>
            </div>
          </div>
        ) : (
          /* ================= CONDITION 2: LOGGED IN RENTER ACTIVE UI ================= */
          <>
            {/* Error Message Box if search failed */}
            {errorMessage && !isLoading && !result && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{errorMessage}</p>
                  <p className="text-[11px] text-text-muted">
                    Try choosing one of the verified sample requests below or type a brand name.
                  </p>
                </div>
              </div>
            )}

            {/* Mic Centerpiece / Recording State */}
            {!result && !isLoading && (
              <div className="space-y-6 pt-2">
                <div className="flex flex-col items-center justify-center py-3 space-y-3">
                  <div className="relative">
                    {isRecording && (
                      <>
                        <span className="absolute -inset-3 rounded-full bg-emerald-500/25 animate-ping opacity-75" />
                        <span className="absolute -inset-6 rounded-full bg-emerald-500/15 animate-pulse opacity-50" />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-95 ${
                        isRecording
                          ? "bg-red-500 text-white shadow-red-500/40 scale-105"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30"
                      }`}
                    >
                      <Mic size={32} className={isRecording ? "animate-pulse" : ""} />
                    </button>
                  </div>

                  <div className="text-center space-y-0.5">
                    <p className="text-xs font-bold text-text-primary">
                      {isRecording ? "Listening... Speak your request" : "Tap Microphone to Speak"}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {isRecording
                        ? liveTranscript
                          ? `"${liveTranscript}"`
                          : "Say item name (e.g. 'Sony camera', 'DJI drone', 'drill')..."
                        : "Or tap a sample below"}
                    </p>
                  </div>
                </div>

                {/* Example Voice Prompts */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted text-center">
                    Verified Sample Requests:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        label: "Sony camera Indiranagar mein",
                        query: "Sony camera chahiye weekend ke liye Indiranagar mein",
                        icon: "📸",
                      },
                      {
                        label: "DJI 4K drone 2 din ke liye",
                        query: "DJI 4K drone rent pe chahiye 2 din ke liye",
                        icon: "🚁",
                      },
                      {
                        label: "DeWalt hammer drill 1 din",
                        query: "DeWalt hammer drill chahiye 1 din ke liye",
                        icon: "🔨",
                      },
                      {
                        label: "Royal Enfield bike Bandra mein",
                        query: "Royal Enfield bike chahiye Bandra mein",
                        icon: "🏍️",
                      },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSampleChipClick(chip.query)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-app hover:bg-white/5 border border-divider hover:border-emerald-500/40 text-left text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer group shadow-sm"
                      >
                        <span className="text-base shrink-0">{chip.icon}</span>
                        <span className="truncate font-medium">{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Text Input Bar */}
                <form onSubmit={handleTextSubmit} className="relative">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Or type equipment: e.g. 'Sony camera for 2 days'..."
                    className="w-full rounded-2xl bg-app border border-divider px-4 py-3 pr-12 text-xs text-text-primary placeholder:text-text-muted focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white transition-all cursor-pointer"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            )}

            {/* ================= STATE 2: LOADING / PROCESSING ================= */}
            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative">
                  <div className="size-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <Mic size={24} className="text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-text-primary">
                    Finding & Verifying Nearby Gear...
                  </p>
                  <p className="text-xs text-text-muted">
                    Checking local inventory, open calendar dates, and escrow rates.
                  </p>
                </div>
              </div>
            )}

            {/* ================= STATE 3: BOOKING CARD PREVIEW ================= */}
            {result && result.bookingCard && !isLoading && (
              <div className="space-y-4 pt-1 animate-[fadeIn_200ms_ease-out]">
                {/* Spoken Response Banner */}
                {result.spokenResponse && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                    <span className="text-base shrink-0">🎙️</span>
                    <p className="text-xs text-emerald-300 leading-relaxed font-medium">
                      "{result.spokenResponse}"
                    </p>
                  </div>
                )}

                {/* Equipment Card Preview */}
                <div className="rounded-2xl bg-app border border-emerald-500/30 p-4 space-y-3.5 shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={result.bookingCard.image}
                      alt={result.bookingCard.title}
                      className="size-16 rounded-xl object-cover border border-divider shrink-0 shadow-sm"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface px-2 py-0.5 rounded border border-divider">
                        {result.bookingCard.category}
                      </span>
                      <h3 className="text-sm font-bold text-text-primary truncate">
                        {result.bookingCard.title}
                      </h3>
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <MapPin size={11} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{result.bookingCard.locality}</span>
                      </p>
                    </div>
                  </div>

                  {/* Date & Duration Selection */}
                  <div className="p-3 rounded-2xl bg-surface border border-divider/70 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-secondary flex items-center gap-1.5">
                        <Calendar size={13} className="text-emerald-400" />
                        <span>Start Date:</span>
                      </span>
                      <input
                        type="date"
                        value={selectedStartDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedStartDate(e.target.value)}
                        className="bg-app border border-divider rounded-xl px-2.5 py-1 text-xs text-text-primary focus:border-emerald-500 focus:outline-none cursor-pointer font-semibold"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-secondary flex items-center gap-1.5">
                        <Zap size={13} className="text-emerald-400" />
                        <span>Duration:</span>
                      </span>
                      <div className="flex items-center gap-1.5 bg-app border border-divider px-1.5 py-0.5 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setSelectedDays((prev) => Math.max(1, prev - 1))}
                          className="h-6 w-6 rounded-lg bg-surface hover:bg-white/10 text-xs flex items-center justify-center font-bold text-text-primary cursor-pointer active:scale-95"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-emerald-400 px-2">
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

                    {/* Quick Duration Chips */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {[1, 2, 3, 5, 7].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDays(d)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            selectedDays === d
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                              : "bg-app hover:bg-white/5 border-divider text-text-muted"
                          }`}
                        >
                          {d === 7 ? "1 Week" : `${d}D`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Escrow Pricing Breakdown */}
                  <div className="space-y-1.5 pt-1 border-t border-divider/60 text-xs">
                    <div className="flex justify-between text-text-secondary">
                      <span>
                        Rental (₹{result.bookingCard.pricing.dailyPrice}/day × {selectedDays}d)
                      </span>
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
                      <span className="text-emerald-400 font-black">
                        ₹
                        {(
                          result.bookingCard.pricing.dailyPrice * selectedDays +
                          result.bookingCard.pricing.securityDeposit
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => goToCheckout(result.bookingCard.itemId)}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Proceed to Escrow Checkout</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setErrorMessage("");
                    }}
                    className="w-full py-2 rounded-xl text-text-muted hover:text-text-primary text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Search Another Item
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
