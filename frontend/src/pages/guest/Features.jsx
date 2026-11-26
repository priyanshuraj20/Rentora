import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mic,
  ShieldCheck,
  CreditCard,
  MapPin,
  Sparkles,
  Lock,
  RefreshCw,
  Zap,
  CheckCircle2,
  Volume2,
  Camera,
  Package,
  Clock,
  ArrowRight,
  Search,
  Layers,
  MessageSquare,
  KeyRound,
  Coins,
  BarChart3,
  Eye,
  Heart,
  Cpu,
  Server,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  Play,
  Pause,
} from "lucide-react";
import useAuth from "../../hooks/authHook";
import toast from "react-hot-toast";
import VoiceBookingAgentModal from "../../components/common/VoiceBookingAgentModal";
import AuthController from "../../components/auth/AuthController";

export default function Features() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "renter" | "owner" | "platform"
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [simulatedPinVerified, setSimulatedPinVerified] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Comprehensive 24 Production Features
  const allFeatures = useMemo(
    () => [
      // ==========================================
      // 🧑‍💼 RENTER FEATURES (8)
      // ==========================================
      {
        id: "voice-booking",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "Sarvam Indic AI",
        icon: <Mic className="size-6 text-primary" />,
        title: "Autonomous Voice-to-Booking Agent",
        summary: "Speak naturally in Hinglish, Hindi, or English to search and book verified gear without typing.",
        problem: "Filling long search forms, filtering categories, and choosing dates on mobile keyboards takes multiple tedious steps.",
        solution: "Integrated with Sarvam AI Saaras STT and Bulbul TTS. Simply tap the mic and speak naturally: 'Bhai Sony camera chahiye weekend ke liye'. The agent searches active inventory, checks calendar dates, calculates escrow amounts, and synthesizes a spoken audio response with a 1-click booking card.",
        flow: ["Mic Audio Input", "Sarvam Saaras STT", "Indic Intent Parser", "MongoDB Inventory Match", "Bulbul Indic Voice", "Pre-filled Booking Card"],
        tech: ["Sarvam Saaras STT", "Sarvam Bulbul TTS", "Indic NLP Parser", "Dynamic Audio Streaming", "Escrow Math Engine"],
      },
      {
        id: "interactive-dates",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "Dynamic Pricing",
        icon: <Clock className="size-6 text-emerald-400" />,
        title: "Interactive Date Picker & Live Escrow Calculator",
        summary: "Customize rental start dates and durations with live real-time price and deposit recalculation.",
        problem: "Hidden charges and fixed durations make it difficult for renters to estimate true rental costs before checkout.",
        solution: "Interactive calendar with quick duration steppers (1D, 2D, 3D, 1 Week) that dynamically recalculates daily rental cost, refundable security deposit, and total escrow lock in real-time. Chosen dates automatically pre-populate the checkout calendar.",
        flow: ["Select Start Date", "Choose Duration Chips", "Real-Time Price Recalc", "Escrow Breakdown", "Auto-Populate Checkout"],
        tech: ["Date Fns", "Real-time Recalc", "Escrow Math Engine", "URL Query Sync"],
      },
      {
        id: "geospatial-discovery",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "MongoDB 2dsphere",
        icon: <MapPin className="size-6 text-blue-400" />,
        title: "Location-Aware Geospatial Discovery",
        summary: "Discover verified equipment in your neighborhood using real GPS coordinates and radius filters.",
        problem: "Renting gear from an owner 50 kilometers away makes physical pickup inconvenient and impractical.",
        solution: "Browser GPS coordinates paired with MongoDB 2dsphere indexing and the Haversine distance formula dynamically calculate exact kilometers to verified equipment in your neighborhood with 5km, 10km, and city-wide radius filters.",
        flow: ["GPS Sensor Capture", "GeoJSON Point", "MongoDB $nearSphere", "Haversine Distance (km)", "Neighborhood Listings"],
        tech: ["MongoDB 2dsphere", "Haversine Formula", "GeoJSON", "Browser Geolocation API"],
      },
      {
        id: "renter-escrow",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "Escrow Protection",
        icon: <CreditCard className="size-6 text-amber-400" />,
        title: "1-Click Razorpay Escrow Financial Protection",
        summary: "Your rental fee and security deposit stay locked in a secure escrow vault until you physically inspect the item.",
        problem: "Direct bank or UPI transfers to individual strangers risk financial loss if the gear is broken, counterfeit, or never handed over.",
        solution: "All rental payments and security deposits are locked inside an automated Razorpay Escrow Vault. The owner is NOT paid until you physically meet, inspect the gear, and authorize fund release using your secret 6-digit delivery PIN.",
        flow: ["Booking Request", "Server-Side Pricing Calc", "Razorpay Checkout", "HMAC Signature Check", "Escrow Vault Locked"],
        tech: ["Razorpay Gateway", "HMAC SHA256", "Centralized Pricing Engine", "Escrow State Machine"],
      },
      {
        id: "renter-pin",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "Proof of Handover",
        icon: <KeyRound className="size-6 text-purple-400" />,
        title: "6-Digit Delivery Handover PIN Protection",
        summary: "Cryptographic proof of receipt. Funds unlock only when you share your secret PIN with the owner in person.",
        problem: "Renters fear losing money if an owner falsely claims the gear was already handed over or disputes delivery.",
        solution: "A cryptographic 6-digit PIN is generated exclusively inside the renter's dashboard upon booking. Funds and gear transfer only when the renter inspects the item in person and shares this PIN with the owner.",
        flow: ["Booking Confirmed", "Unique 6-Digit PIN Generated", "In-Person Inspection", "PIN Shared with Owner", "Escrow Released"],
        tech: ["Cryptographic PIN", "One-Time Token", "Verification API", "Delivery Proof"],
      },
      {
        id: "realtime-chat",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "Socket.io WebSockets",
        icon: <MessageSquare className="size-6 text-pink-400" />,
        title: "Real-Time Live Chat with Gear Owners",
        summary: "Direct WebSocket messaging to ask questions, verify accessories, and coordinate handovers instantly.",
        problem: "Calling phone numbers or waiting for email replies slows down urgent rental coordination.",
        solution: "Isolated WebSocket chat rooms allow renters and owners to instantly negotiate pickup times, ask about gear accessories, and coordinate handovers with live online indicators and unread message counters.",
        flow: ["JWT Handshake", "Isolated Room Join", "Instant Message Emit", "Real-Time UI Update", "Unread Counter Sync"],
        tech: ["Socket.io", "WebSocket Protocol", "JWT Room Auth", "Event-Driven UI"],
      },
      {
        id: "booking-lifecycle",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "Strict State Machine",
        icon: <Layers className="size-6 text-cyan-400" />,
        title: "Multi-Stage Booking Lifecycle Tracker",
        summary: "Clear state-machine tracking from request to approval, active rental, and deposit refund.",
        problem: "Unclear rental statuses cause confusion about when to pay, pick up, or return equipment.",
        solution: "A rigorous state machine guides every booking through unambiguous stages: Requested → Owner Approved → Escrow Locked → Active Rental → Returned → Security Deposit Released.",
        flow: ["Requested", "Approved", "Escrow Locked", "Ongoing Rental", "Completed & Deposit Refunded"],
        tech: ["Mongoose Enums", "Strict Transition Guards", "Audit Logs", "Automated Expiry"],
      },
      {
        id: "renter-wishlist",
        persona: "renter",
        personaLabel: "Renter Feature",
        badge: "Personal Collection",
        icon: <Heart className="size-6 text-rose-400" />,
        title: "Wishlist & Equipment Bookmarking",
        summary: "Bookmark premium cameras, drones, and gear for upcoming weekend shoots or vacation plans.",
        problem: "Renters discover dream gear for upcoming projects but lose track of the listings when they need them.",
        solution: "One-click bookmarking saves desired cameras, drones, and tools into a private wishlist for quick comparison and future 1-click reservations.",
        flow: ["Heart Toggle", "User Wishlist Collection", "Instant Sync", "Fast Reservation Access"],
        tech: ["MongoDB Sub-Documents", "Optimistic UI Update", "Quick Checkout Bridge"],
      },

      // ==========================================
      // 💼 OWNER FEATURES (7)
      // ==========================================
      {
        id: "owner-listing",
        persona: "owner",
        personaLabel: "Owner Feature",
        badge: "Instant Publishing",
        icon: <Camera className="size-6 text-emerald-400" />,
        title: "1-Minute Asset Listing & Photo Management",
        summary: "Publish cameras, drones, tools, or bikes with multi-photo uploads, category tags, and rules in under 60 seconds.",
        problem: "Listing assets on traditional classifieds requires long forms, manual reviews, and tedious delays.",
        solution: "Intuitive listing wizard to publish cameras, drones, power tools, or vehicles with multiple high-res photos, condition tags, category assignment, and usage guidelines in under 60 seconds.",
        flow: ["Gear Details & Photos", "Category & Tags", "Rate & Deposit Config", "Zod Validation", "Instant Live Publishing"],
        tech: ["Cloud Storage", "Zod Validation", "Image Optimization", "MongoDB Indexing"],
      },
      {
        id: "owner-pricing",
        persona: "owner",
        personaLabel: "Owner Feature",
        badge: "Revenue Flexibility",
        icon: <Coins className="size-6 text-amber-400" />,
        title: "Custom Rental Rates & Refundable Deposit Controls",
        summary: "Set custom daily rates and define mandatory security deposits to safeguard high-value gear.",
        problem: "Rigid flat pricing prevents owners from offering discounts for longer rentals or protecting expensive gear.",
        solution: "Owners set custom daily, weekly, and monthly discount rates alongside refundable damage security deposits to ensure full peace of mind for high-value equipment.",
        flow: ["Define Daily Base Rate", "Set Duration Discounts", "Specify Security Deposit", "Escrow Enforcement"],
        tech: ["Tiered Discount Engine", "Deposit Protection Logic", "Server-Side Pricing"],
      },
      {
        id: "owner-handover",
        persona: "owner",
        personaLabel: "Owner Feature",
        badge: "Dispute Elimination",
        icon: <ShieldCheck className="size-6 text-primary" />,
        title: "15-Second Dynamic Rotating PIN & Condition Photo Handover",
        summary: "Verify the renter's live 15-second dynamic PIN and compare inspection photos at pickup for 100% dispute protection.",
        problem: "Owners worry that renters might damage gear and deny ever receiving it, leaving the owner with no proof.",
        solution: "At pickup, the owner inspects equipment with condition photos and enters the renter's live 15-second dynamic PIN (TOTP). This creates an indisputable mathematical audit trail before gear leaves the owner's hands.",
        flow: ["Renter Arrives", "Inspect Gear & Take Photos", "Owner Enters 15s Dynamic PIN", "State Machine Validates", "Handover Certified"],
        tech: ["Dynamic TOTP PIN API", "15s Expiration Engine", "Condition Photo Appraisal", "Escrow Handover Lock"],
      },
      {
        id: "owner-payouts",
        persona: "owner",
        personaLabel: "Owner Feature",
        badge: "Guaranteed Payout",
        icon: <Zap className="size-6 text-emerald-400" />,
        title: "Automated Escrow Bank Payouts",
        summary: "Zero-delay rental revenue transfer directly into your linked bank account upon physical handover.",
        problem: "Chasing renters for cash or UPI transfers after the rental period leads to awkward delays and defaults.",
        solution: "Because the renter's payment was pre-locked in Razorpay Escrow, validating the handover PIN automatically unlocks and routes the rental earnings directly to the owner's linked bank account.",
        flow: ["Handover Certified", "Escrow Unlock Trigger", "Razorpay Transfer Initiated", "Direct Bank Credit", "Invoice Generated"],
        tech: ["Razorpay Route/Transfers", "Automated Webhooks", "Escrow Release Worker"],
      },
      {
        id: "owner-approval",
        persona: "owner",
        personaLabel: "Owner Feature",
        badge: "Owner Autonomy",
        icon: <CheckCircle2 className="size-6 text-blue-400" />,
        title: "Booking Request Management & Profile Approval",
        summary: "Review renter profiles, requested rental dates, and earnings calculation before approving or declining.",
        problem: "Auto-booking can force owners to rent valuable equipment to suspicious or unverified individuals.",
        solution: "Owners receive immediate booking notifications with the renter's identity, rental dates, and earnings calculation, giving complete autonomy to approve or decline with a single tap.",
        flow: ["New Booking Request", "Renter Details Review", "Approve or Reject", "Calendar Dates Blocked", "Renter Notified"],
        tech: ["Booking Approval API", "Calendar Lock Engine", "Socket.io Alerts"],
      },
      {
        id: "owner-analytics",
        persona: "owner",
        personaLabel: "Owner Feature",
        badge: "Business Analytics",
        icon: <BarChart3 className="size-6 text-purple-400" />,
        title: "Live Earnings Dashboard & Inventory Utilization",
        summary: "Track total revenue, active ongoing rentals, equipment utilization percentages, and payout history.",
        problem: "Owners cannot see which items generate the highest return on investment or track active monthly revenues.",
        solution: "Comprehensive analytics dashboard displaying total revenue, active ongoing rentals, equipment utilization percentages, and itemized historical payouts.",
        flow: ["Dashboard Visit", "MongoDB Aggregation", "Revenue Metric Calculation", "Rental Health Card", "Interactive Visuals"],
        tech: ["MongoDB Aggregation Pipelines", "Real-Time Stat Counters", "Responsive Charting"],
      },
      {
        id: "owner-tour",
        persona: "owner",
        personaLabel: "Owner Feature",
        badge: "Sarvam Indic Audio",
        icon: <Volume2 className="size-6 text-primary" />,
        title: "Owner Guided Indic AI Audio Tour",
        summary: "Interactive, voice-guided tour in 11 Indian languages explaining listings, handovers, and escrow payouts.",
        problem: "New gear owners need quick onboarding to understand how listings, PIN verification, and escrow payouts work.",
        solution: "An interactive, voice-guided tour narrated in 11 Indian languages that points to and highlights each section of the owner dashboard in real time with synchronized DOM focus.",
        flow: ["Click Audio Guide", "Select Indic Language", "Sarvam Bulbul TTS Stream", "Synchronized Box Highlighting", "Complete Onboarding"],
        tech: ["Sarvam Bulbul TTS", "Audio Blob Caching", "DOM Scroll Synchronizer", "11 Indian Dialects"],
      },

      // ==========================================
      // 🛡️ PLATFORM & AI SECURITY (9)
      // ==========================================
      {
        id: "sarvam-engine",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "Speech Intelligence",
        icon: <Sparkles className="size-6 text-primary" />,
        title: "Sarvam AI Indic Voice Engine (11 Languages)",
        summary: "Speech-to-text and text-to-speech support in Hindi, Gujarati, Marathi, Tamil, Telugu, and 6 more Indian languages.",
        problem: "Most AI agents only understand formal English, excluding millions of Indic and vernacular language speakers across India.",
        solution: "Deep integration with Sarvam AI's Saaras STT and Bulbul TTS models supporting 11 Indian languages: Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, Odia, and English.",
        flow: ["Microphone Audio", "Saaras v4 Transcription", "Indic NLP Intent Recognition", "Bulbul v2 Audio Synthesis", "Native WAV Playback"],
        tech: ["Sarvam Saaras STT", "Sarvam Bulbul TTS", "Indic Transliteration", "WAV Buffer Cache"],
      },
      {
        id: "antifraud-architecture",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "Zero-Fraud Guarantee",
        icon: <ShieldCheck className="size-6 text-emerald-400" />,
        title: "Dual-Layer Anti-Fraud Handover Architecture",
        summary: "Cryptographic 6-digit PIN combined with timestamped acoustic voice recording to prevent all false delivery claims.",
        problem: "Traditional rental marketplaces suffer from false claims of non-delivery, damaged gear swaps, and missing items.",
        solution: "Rentora combines a cryptographic 6-digit one-time PIN with a physical acoustic voice statement at the moment of exchange, creating an immutable cryptographic audit record.",
        flow: ["Cryptographic PIN Check", "Acoustic Voice Capture", "SHA256 Handshake Signature", "Immutable Audit Entry", "Escrow Authorization"],
        tech: ["HMAC Validation", "Voice Biometric Blob", "Audit Trail Logging", "State Machine Guard"],
      },
      {
        id: "rbac-guards",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "Strict RBAC",
        icon: <Lock className="size-6 text-red-400" />,
        title: "Role-Based Access Control (RBAC) & Layout Isolation",
        summary: "Strict layout isolation and route guards between Guest, Renter, Owner, and Admin governance with auto-redirects.",
        problem: "Weak authorization allows malicious users to tamper with other user roles or access restricted management dashboards.",
        solution: "Strict route guards with separate layout trees for Guests, Renters, Owners, and Admins. Protected routes immediately reject unauthorized tokens and enforce automatic role-based landing redirection.",
        flow: ["Incoming HTTP Request", "JWT Decryption", "Role Claim Verification", "ProtectedRoute Filter", "Authorized Layout Render"],
        tech: ["JWT Role Claims", "React Router Guards", "HTTP-Only Session Cookies", "RoleRedirect Hook"],
      },
      {
        id: "admin-governance",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "Platform Oversight",
        icon: <Server className="size-6 text-amber-400" />,
        title: "Admin Governance & Escrow Dispute Portal",
        summary: "Dedicated governance dashboard for platform GMV tracking, escrow dispute arbitration, and item moderation.",
        problem: "Marketplace trust collapses without centralized administrative oversight and fair dispute arbitration.",
        solution: "A dedicated Super-Admin Governance Portal allowing administrators to monitor platform GMV, resolve escrow disputes, ban bad actors, and moderate suspicious equipment listings.",
        flow: ["Admin Authentication", "Global Platform Metrics", "Dispute Case Review", "Evidence Inspection", "Binding Escrow Arbitration"],
        tech: ["Admin Portal Layout", "Audit Log Inspector", "Escrow Override Controls", "Platform Aggregates"],
      },
      {
        id: "dual-search",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "High Availability",
        icon: <Search className="size-6 text-blue-400" />,
        title: "Dual Search Engine with Zero-Downtime Fallback",
        summary: "Elasticsearch fuzzy query cluster with automated instant failover to MongoDB regex search.",
        problem: "Dedicated search clusters like Elasticsearch can occasionally experience latency spikes or downtime.",
        solution: "High-performance Elasticsearch fuzzy search with an automated instant failover mechanism that switches to MongoDB regex search without dropping user queries if Elasticsearch is unreachable.",
        flow: ["Search Request", "Elasticsearch Query Attempt", "(On Timeout / Outage)", "Instant MongoDB Regex Failover", "Zero Interruption Results"],
        tech: ["Elasticsearch Cluster", "MongoDB Regex Fallback", "BullMQ Sync Workers", "Resilient Circuit"],
      },
      {
        id: "enterprise-security",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "OWASP Hardened",
        icon: <Lock className="size-6 text-purple-400" />,
        title: "Enterprise Multi-Layer Web Security",
        summary: "HTTP-only cookie auth, Redis token blacklist on logout, double CSRF verification, and bcrypt hashing.",
        problem: "Modern web applications face CSRF token stealing, XSS attacks, credential stuffing, and brute force flooding.",
        solution: "HTTP-only cookie auth with Redis Refresh Token Blacklisting upon logout, double CSRF verification, Express rate limiters, bcrypt password hashing, and Zod schema sanitization.",
        flow: ["HTTP-Only Cookie", "Redis Blacklist Verification", "Double CSRF Header Validation", "Rate Limiter", "Controller Execution"],
        tech: ["Redis Blacklist", "Double CSRF Protection", "Bcrypt Hashing", "Express Rate Limiting", "Zod Validation"],
      },
      {
        id: "background-queues",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "Async Architecture",
        icon: <Cpu className="size-6 text-cyan-400" />,
        title: "BullMQ & Redis Background Task Queues",
        summary: "Asynchronous worker queues offloading heavy email notifications, photo purging, and expired booking transitions.",
        problem: "Processing heavy operations like sending emails, expiring old bookings, or syncing indexes synchronously blocks HTTP response threads.",
        solution: "BullMQ background task queues offload heavy workloads to dedicated Redis worker processes with automated retries and dead-letter queue handling.",
        flow: ["API Controller Action", "Push Job to BullMQ Queue", "Redis Worker Execution", "Automated Retry on Failure", "Completed Job Audit"],
        tech: ["BullMQ", "Redis Cache & Queues", "Resend Email Worker", "Booking Expiry Worker"],
      },
      {
        id: "server-pricing",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "Tamper Proof",
        icon: <CreditCard className="size-6 text-emerald-400" />,
        title: "Centralized Server-Side Pricing Engine",
        summary: "Tamper-proof calculator preventing client-side amount manipulation before Razorpay order generation.",
        problem: "Malicious clients can edit JavaScript numbers in browser dev tools to buy high-value rentals for ₹1.",
        solution: "All financial totals, daily rates, discounts, and refundable security deposits are recalculated strictly on the backend server before creating Razorpay orders and signing HMAC SHA256 checksums.",
        flow: ["Booking Payload", "Database Rate Lookup", "Server-Side Pricing Engine", "Razorpay Order Creation", "HMAC SHA256 Signature"],
        tech: ["HMAC SHA256", "Server-Side Calculations", "Razorpay Order API", "Mongoose Pricing Schema"],
      },
      {
        id: "websocket-engine",
        persona: "platform",
        personaLabel: "Platform & AI",
        badge: "Sub-Second Sync",
        icon: <MessageSquare className="size-6 text-rose-400" />,
        title: "Real-Time WebSocket Engine (Socket.io)",
        summary: "Bi-directional WebSocket server delivering live booking updates, typing indicators, and instant notifications.",
        problem: "Users shouldn't need to manually refresh the page to see if an owner approved their booking or replied to a message.",
        solution: "Bi-directional WebSocket server that pushes live booking updates, typing indicators, and instant handover notifications straight to the browser within milliseconds.",
        flow: ["Browser Client Handshake", "JWT Authenticated Room", "Server Event Dispatch", "Sub-Second Client Update"],
        tech: ["Socket.io Engine", "Room Isolation", "Presence Detection", "Event Dispatcher"],
      },
    ],
    []
  );

  // Filter features based on Tab & Search Query
  const filteredFeatures = useMemo(() => {
    return allFeatures.filter((f) => {
      const matchesTab = activeTab === "all" || f.persona === activeTab;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesTab;

      const matchesSearch =
        f.title.toLowerCase().includes(query) ||
        f.summary.toLowerCase().includes(query) ||
        f.badge.toLowerCase().includes(query) ||
        f.problem.toLowerCase().includes(query) ||
        f.solution.toLowerCase().includes(query) ||
        f.tech.some((t) => t.toLowerCase().includes(query));

      return matchesTab && matchesSearch;
    });
  }, [allFeatures, activeTab, searchQuery]);

  const counts = useMemo(
    () => ({
      all: allFeatures.length,
      renter: allFeatures.filter((f) => f.persona === "renter").length,
      owner: allFeatures.filter((f) => f.persona === "owner").length,
      platform: allFeatures.filter((f) => f.persona === "platform").length,
    }),
    [allFeatures]
  );

  return (
    <div className="bg-app min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-primary/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
            <Sparkles size={13} />
            <span>24+ Production Features Built for Real Trust</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-text-primary tracking-tight leading-[1.08]">
            Complete Feature Hub for <br />
            <span className="bg-gradient-to-r from-primary via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              Renters, Owners & Security
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Everything inside Rentora is engineered for safety, speed, and peer-to-peer convenience: from autonomous Indic AI voice booking to bank-grade Razorpay escrow, cryptographic 6-digit PIN delivery, and real-time WebSockets.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              onClick={() => setVoiceAgentOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Mic size={14} className="animate-pulse" />
              <span>Try Autonomous Voice Agent</span>
            </button>

            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl bg-surface hover:bg-white/5 border border-divider text-text-primary text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <Search size={14} />
              <span>Browse Nearby Equipment</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE SPOTLIGHT: 3 CORE VISUAL CAPABILITIES         */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Spotlight Card 1: Autonomous Indic Voice Agent */}
          <div className="relative rounded-3xl bg-surface/90 border border-primary/30 p-6 sm:p-7 shadow-xl space-y-4 overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shadow-sm">
                <Mic size={24} className="animate-pulse" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30">
                Sarvam AI Voice
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-text-primary">
                Speak Naturally to Rent Anything
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Powered by Sarvam AI Saaras STT & Bulbul TTS in 11 Indian languages. No typing required.
              </p>
            </div>

            {/* Simulated Voice Waveform */}
            <div className="p-3 rounded-2xl bg-app border border-divider space-y-2">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>Try Saying:</span>
                <span className="text-primary font-bold">11 Indic Languages</span>
              </div>
              <div className="text-xs text-text-primary italic font-medium bg-surface/80 p-2.5 rounded-xl border border-divider/60">
                "Bhai Sony camera chahiye weekend ke liye Indiranagar mein"
              </div>
              <div className="flex items-center gap-1 justify-center pt-1 h-5">
                {[12, 24, 16, 28, 14, 22, 32, 18, 26, 12, 20].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-primary/70 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setVoiceAgentOpen(true)}
              className="w-full py-2.5 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-text-primary text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-primary/30 shadow-sm"
            >
              <span>Launch Voice Booking Agent</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Spotlight Card 2: 6-Digit Handover PIN & Acoustic Voice */}
          <div className="relative rounded-3xl bg-surface/90 border border-purple-500/30 p-6 sm:p-7 shadow-xl space-y-4 overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center shadow-sm">
                <KeyRound size={24} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
                Zero-Fraud Handover
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-text-primary">
                6-Digit PIN + Acoustic Consent
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Prevents false claims of non-delivery. Escrow funds unlock only upon verified in-person exchange.
              </p>
            </div>

            {/* Interactive PIN Simulation Box */}
            <div className="p-3 rounded-2xl bg-app border border-divider space-y-2">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>Renter Secret Delivery PIN:</span>
                <span className="text-emerald-400 font-bold">1-Time Token</span>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                {["4", "8", "2", "9", "1", "7"].map((digit, i) => (
                  <span
                    key={i}
                    className="w-8 h-10 rounded-xl bg-surface border border-purple-500/40 text-text-primary font-mono font-black text-base flex items-center justify-center shadow-sm"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-text-muted text-center pt-1">
                Owner enters PIN + records voice agreement before gear is released.
              </p>
            </div>

            <button
              onClick={() => {
                setSimulatedPinVerified(!simulatedPinVerified);
                toast.success(
                  simulatedPinVerified
                    ? "Reset PIN verification demo"
                    : "✅ PIN 482917 Verified! Escrow funds released to owner."
                );
              }}
              className="w-full py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-purple-500/30 shadow-sm"
            >
              <span>{simulatedPinVerified ? "✅ Handover Certified" : "Simulate Owner PIN Check"}</span>
              <CheckCircle2 size={13} />
            </button>
          </div>

          {/* Spotlight Card 3: Razorpay Escrow Protection */}
          <div className="relative rounded-3xl bg-surface/90 border border-emerald-500/30 p-6 sm:p-7 shadow-xl space-y-4 overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shadow-sm">
                <CreditCard size={24} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Razorpay Escrow Vault
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-text-primary">
                100% Escrow Protection
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Rent & refundable security deposits remain locked until inspection. Zero direct cash risk.
              </p>
            </div>

            {/* Escrow Steps Timeline */}
            <div className="p-3 rounded-2xl bg-app border border-divider space-y-2 text-xs">
              <div className="flex items-center justify-between text-text-secondary">
                <span>1. Renter Pays:</span>
                <span className="font-bold text-text-primary">Locked in Escrow</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>2. PIN Verified:</span>
                <span className="font-bold text-emerald-400">Owner Receives Rent</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>3. Gear Returned:</span>
                <span className="font-bold text-blue-400">Deposit Refunded</span>
              </div>
            </div>

            <Link
              to="/explore"
              className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/30 shadow-sm"
            >
              <span>Explore Escrow-Guaranteed Items</span>
              <ArrowRight size={13} />
            </Link>
          </div>

        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE CONTROLS: TABS & SEARCH BAR                   */}
        {/* ========================================================= */}
        <div className="space-y-4 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-divider pb-5">
            
            {/* Persona Tabs */}
            <div className="inline-flex rounded-2xl bg-surface p-1.5 border border-divider shadow-sm w-full md:w-auto overflow-x-auto">
              {[
                { key: "all", label: "All Features", count: counts.all, icon: "✨" },
                { key: "renter", label: "For Renters", count: counts.renter, icon: "🧑‍💼" },
                { key: "owner", label: "For Owners", count: counts.owner, icon: "💼" },
                { key: "platform", label: "Platform & Security", count: counts.platform, icon: "🛡️" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-primary text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      activeTab === tab.key
                        ? "bg-black/20 text-white"
                        : "bg-app text-text-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any feature (e.g. 'voice', 'pin', 'gps')..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface border border-divider focus:border-primary text-xs text-text-primary focus:outline-none placeholder:text-text-muted transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <span>
              Showing <b className="text-text-primary">{filteredFeatures.length}</b> features
              {searchQuery ? ` matching "${searchQuery}"` : ""}
            </span>
            <span className="text-[11px]">
              Engineered with Node.js, TypeScript, MongoDB 2dsphere, Redis, BullMQ & Sarvam AI
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMPREHENSIVE FEATURES GRID (24 CARDS)                    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-surface border border-divider hover:border-primary/40 transition-all p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                {/* Header Row: Icon + Badges */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-app border border-divider flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        item.persona === "renter"
                          ? "bg-primary/15 text-primary border border-primary/25"
                          : item.persona === "owner"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                      }`}
                    >
                      {item.personaLabel}
                    </span>

                    <span className="text-[10px] font-semibold bg-app text-text-muted border border-divider px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-text-primary tracking-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Problem & Solution Accordion-style layout */}
                <div className="p-3.5 rounded-2xl bg-app border border-divider/70 space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] font-extrabold text-error uppercase tracking-wider mr-1.5">
                      Problem:
                    </span>
                    <span className="text-text-secondary">{item.problem}</span>
                  </div>
                  <div className="pt-1.5 border-t border-divider/50">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider mr-1.5">
                      Rentora Solution:
                    </span>
                    <span className="text-text-primary">{item.solution}</span>
                  </div>
                </div>

                {/* System Step Flow */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                    Execution Flow:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-medium text-text-primary">
                    {item.flow.map((step, idx) => (
                      <span key={idx} className="flex items-center gap-1.5">
                        <span className="bg-surface px-2 py-0.5 rounded-md border border-divider/60">
                          {step}
                        </span>
                        {idx < item.flow.length - 1 && (
                          <span className="text-primary font-bold text-xs">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Tech Tags */}
              <div className="pt-4 border-t border-divider flex flex-wrap gap-1.5">
                {item.tech.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-app text-text-muted border border-divider px-2 py-0.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if search returns no results */}
        {filteredFeatures.length === 0 && (
          <div className="text-center py-16 space-y-3 bg-surface border border-divider rounded-3xl p-8">
            <Search size={32} className="mx-auto text-text-muted" />
            <h4 className="text-base font-bold text-text-primary">No features matched "{searchQuery}"</h4>
            <p className="text-xs text-text-muted">Try searching for keywords like "voice", "pin", "escrow", "gps", or "chat".</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="px-4 py-2 rounded-xl bg-primary text-text-primary text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM CTA: START RENTING OR EARNING                      */}
        {/* ========================================================= */}
        <div className="rounded-3xl bg-surface border border-divider p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-display">
              Ready to Experience Rentora?
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
              Explore cameras, drones, tools, and bikes in your neighborhood, or list your own gear and start earning steady passive income today.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                to="/explore"
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 font-display"
              >
                <span>Explore Equipment</span>
                <ArrowRight size={15} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthOpen(true);
                }}
                className="px-6 py-3.5 rounded-xl bg-card hover:bg-white/5 border border-divider text-text-primary text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer font-display"
              >
                <span>Join Rentora</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Mount Real Voice Booking Agent Modal & Auth Modal */}
      <VoiceBookingAgentModal
        open={voiceAgentOpen}
        onClose={() => setVoiceAgentOpen(false)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthOpen(true);
        }}
      />

      <AuthController
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}
