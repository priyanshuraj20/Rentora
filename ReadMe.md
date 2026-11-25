# Rentora — Autonomous Peer-to-Peer Rental Marketplace

> **Rentora** is a production-grade, location-aware peer-to-peer (P2P) equipment rental marketplace engineered with **Node.js, TypeScript, Express, React 18 (Vite), MongoDB, Redis, BullMQ, Socket.io, Elasticsearch, Sarvam AI (Saaras STT + Bulbul TTS), Google Gemini Multimodal AI, and Razorpay Escrow**.

[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20TypeScript%20%7C%20React%20%7C%20MongoDB%20%7C%20Redis-orange?style=flat-square)](https://github.com)
[![Sarvam AI](https://img.shields.io/badge/Indic%20Voice%20AI-Sarvam%20AI%20(Saaras%20%2B%20Bulbul)-purple?style=flat-square)](https://sarvam.ai)
[![AI Guard](https://img.shields.io/badge/AI%20Inspection-Google%20Gemini%201.5%20Flash-blue?style=flat-square)](https://ai.google.dev)
[![Payments](https://img.shields.io/badge/Escrow%20Payments-Razorpay%20Escrow%20%2B%20Refunds-emerald?style=flat-square)](https://razorpay.com)
[![Search](https://img.shields.io/badge/Search-Elasticsearch%20%2B%20Mongo%20Fallback-green?style=flat-square)](https://elastic.co)
[![Security](https://img.shields.io/badge/Security-Double%20CSRF%20%2B%20JWT%20Blacklist%20%2B%20PIN%20Guard-red?style=flat-square)](https://github.com)

---

## 🌟 Executive Overview

Rentora enables item owners to safely monetize underutilized high-value assets (cameras, drones, power tools, bikes, camping gear, electronics) while giving renters cost-effective, hyper-local short-term access.

Unlike traditional rental platforms that rely on manual forms, insecure cash handshakes, and slow dispute resolution, Rentora introduces:
1. **Autonomous Indic Voice-to-Booking Agent**: Speak naturally in Hinglish, Hindi, or English to search active inventory, validate open dates, and build an escrow booking card in seconds without typing.
2. **Synchronized Indic Audio Dashboard Guides**: Voice-guided onboarding in **11 Indian languages** powered by Sarvam AI Bulbul TTS with real-time DOM element highlighting.
3. **Dual-Layer Anti-Fraud Handover Architecture**: 6-digit cryptographic delivery PIN combined with **acoustic voice consent recording** to eliminate false non-delivery disputes.
4. **Autonomous Escrow Financial Lifecycle**: 100% rental fees and refundable deposits locked in Razorpay Escrow until verified physical inspection.
5. **Multimodal Computer Vision AI Damage Inspection**: Google Gemini 1.5 Flash comparing Handover vs. Return condition photos to detect damage and automate deposit settlements.
6. **Admin Governance & Compliance Portal**: Real-time escrow ledger, transaction arbitration, and one-click user moderation.

---

## 🚀 Key Engineering Differentiators

| Core Engine | Technical Implementation | Purpose & Benefit |
|---|---|---|
| 🎙️ **Autonomous Indic Voice Booking** | Sarvam AI Saaras STT (`saaras:v4`) + Devanagari NLP Parser + Bulbul TTS (`bulbul:v2`) | Rent gear simply by speaking in Hinglish/Hindi/English; auto-matches inventory, validates dates, and builds escrow booking cards |
| 🗣️ **Synchronized Indic Audio Tours** | Sarvam Bulbul TTS Streaming WAV + DOM focus synchronizer (`ring-4 ring-primary`) | 11-language interactive audio walkthroughs for Renters and Owners with real-time on-screen box highlighting |
| 🔐 **Dual-Layer PIN + Voice Handover** | Cryptographic 6-digit PIN + Acoustic Voice Consent Recording stored in audit logs | Eliminates false non-delivery and theft claims; escrow funds unlock only upon mutual in-person verification |
| 🤖 **Multimodal AI Return Inspection** | Google Gemini 1.5 Flash comparing Handover vs Return photos | Autonomous visual damage assessment, repair cost estimation, and dispute elimination |
| 🛡️ **Autonomous Risk Guard** | Real-time AI damage categorization (`TIER_0` to `TIER_3`) | Auto-suspends malicious renters (`isBlocked=true`) on severe damage/total loss without admin intervention |
| 💳 **Platform Escrow & Split Payment** | Razorpay Escrow + Automated Refund API | Security deposits held in platform escrow; 10% platform fee auto-retained by Admin, 90% net payout to Owner |
| 📍 **Hyper-Local GPS & Micro-Locality** | Nominatim Geocoding + Redis Cache + Mongo `2dsphere` + Area Locality | 1-click GPS auto-detection, exact area tagging (e.g., Indiranagar, Alkapuri), and Haversine distance calculations |
| 📸 **Ephemeral Photo Lifecycle** | BullMQ 3-Day Delay Queue + Cloudinary Admin SDK | Handover/Return photo evidence automatically purged after 3 days to preserve privacy and minimize storage |
| 🏛️ **Admin Governance & Audit Ledger** | Real-time Escrow Ledger + User Access Controls | Full platform financial transparency, side-by-side evidence inspection, and one-click user suspension |
| 🔍 **Zero-Downtime Smart Search** | Elasticsearch v8 Fuzzy Search + MongoDB Regex Fallback | High-performance search resilience even if Elasticsearch cluster drops offline |
| 💬 **Real-Time WebSockets** | Socket.io with JWT cookie authentication & isolated booking rooms | Real-time direct chat, typing status, message delivery receipts, and live notification badge updates |
| ⚡ **Resilient Async Queues** | BullMQ + Redis for background jobs with auto-retry | Decoupled email delivery (Resend), ES catalog sync, scheduled status workers, and evidence photo purge |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Layer (React 18 + Vite + Tailwind CSS)"]
        RenterUI["Renter Portal (/explore, /rentals, /checkout)"]
        OwnerUI["Owner Portal (/listings, /bookings, /earnings)"]
        AdminUI["Admin Governance Portal (/admin)"]
        VoiceAgentModal["Voice Booking Agent Modal (Mic Audio + NLP)"]
        VoiceTourHUD["Indic Audio Tour HUD (11 Languages)"]
        SocketClient["Socket.io Client (Real-Time Messaging)"]
    end

    subgraph SecurityGateway["API Gateway & Security Layer"]
        ExpressApp["Express.js HTTP & Socket Server (TypeScript)"]
        AuthGuard["JWT Verification + Redis Blacklist Check"]
        CSRFGuard["Double-Submit CSRF Guard (timingSafeEqual)"]
        RateLimiter["Express Rate Limiter"]
        RoleGuard["Role-Based Access Guard (Renter / Owner / Admin)"]
    end

    subgraph AIServices["Artificial Intelligence & Voice Engines"]
        SarvamSTT["Sarvam AI Saaras v4 STT (Indic Speech-to-Text)"]
        SarvamTTS["Sarvam AI Bulbul v2 TTS (Indic Speech Synthesis)"]
        IntentParser["Indic NLP & Devanagari Intent Parser"]
        GeminiVision["Google Gemini 1.5 Flash (Damage Inspection)"]
    end

    subgraph CoreServices["Domain Business Services"]
        VoiceService["Voice & Audio Streaming Service"]
        VoiceAgentService["Autonomous Voice Booking Agent Service"]
        ExploreService["Explore & Geo-Engine (Haversine Distance)"]
        BookingService["Booking State Machine & Duration Calculator"]
        PricingEngine["Centralized Server-Side Pricing Engine"]
        PaymentService["Razorpay Escrow & Settlement Service"]
        PINEngine["6-Digit Verification PIN & Voice Consent Engine"]
    end

    subgraph StorageInfra["Persistence & Infrastructure Layer"]
        MongoDB[("MongoDB Replica Set (2dsphere Spatial Index)")]
        RedisCache[("Redis 7 (BullMQ Broker + Token Blacklist + Audio Cache)")]
        Elasticsearch[("Elasticsearch v8 (Fuzzy Search Index)")]
        CloudinaryCDN["Cloudinary CDN (Evidence & Item Media)"]
        RazorpayGate["Razorpay Payment Gateway (Escrow Orders & Refunds)"]
    end

    subgraph BackgroundWorkers["Asynchronous Job Queues (BullMQ)"]
        EmailWorker["Email Queue Worker (Resend OTP & Alerts)"]
        ESSyncWorker["Elasticsearch Sync Worker (Catalog Sync)"]
        PurgeWorker["Photo Purge Worker (3-Day Ephemeral Retention)"]
        StatusWorker["Booking Status Worker (Date Transitions)"]
    end

    RenterUI & OwnerUI & AdminUI & VoiceAgentModal & VoiceTourHUD -->|HTTPS REST API| ExpressApp
    SocketClient <-->|WSS WebSockets| ExpressApp
    ExpressApp --> CSRFGuard --> RateLimiter --> AuthGuard --> RoleGuard
    RoleGuard --> CoreServices
    VoiceAgentService --> SarvamSTT & IntentParser & SarvamTTS
    VoiceService --> SarvamTTS
    BookingService --> GeminiVision
    BookingService --> PINEngine
    PaymentService --> RazorpayGate
    CoreServices --> MongoDB
    CoreServices --> RedisCache
    CoreServices --> CloudinaryCDN
    CoreServices -->|Dispatch Job| RedisCache
    RedisCache --> BackgroundWorkers
    BackgroundWorkers --> MongoDB & Elasticsearch & CloudinaryCDN
```

---

## 🔄 Core Business Lifecycles & Flowcharts

### 1. Autonomous Indic Voice-to-Booking Agent Data Flow

```mermaid
sequenceDiagram
    autonumber
    participant Renter as Renter (Browser Mic)
    participant Modal as VoiceBookingAgentModal
    participant Server as Voice Agent API
    participant Saaras as Sarvam Saaras STT
    participant NLP as Intent and Duration Parser
    participant DB as MongoDB Inventory
    participant Bulbul as Sarvam Bulbul TTS
    participant Checkout as RentCheckout Page

    Renter->>Modal: Tap Mic and Speak - Bhai Sony camera chahiye weekend ke liye
    Modal->>Server: POST /voice/agent with audio/webm and lang
    Server->>Saaras: Transcribe Audio Buffer (saaras v4)
    Saaras-->>Server: Raw Transcript - भाई सोनी कैमरा चाहिए वीकेंड के लिए
    Server->>NLP: Parse Keywords, Hindi Numerals and Duration
    Note over NLP: सोनी = Sony, कैमरा = Camera, वीकेंड = 2 Days
    NLP->>DB: Query Item by title, description or category where isActive is true
    DB-->>Server: Matched Item - Sony A7 IV, ₹1400 per day, ₹5000 deposit
    Server->>Server: Compute Escrow - ₹1400 x 2 days = ₹2800 rent, plus ₹5000 deposit = ₹7800 total
    Server->>Bulbul: Synthesize Hinglish Confirmation Audio (bulbul v2)
    Bulbul-->>Server: Audio Buffer (WAV Base64)
    Server-->>Modal: Return success, bookingCard, audioBase64 and spokenResponse
    Modal->>Renter: Autoplay Voice Reply and Render Booking Card with Date Picker
    Renter->>Modal: Adjust Duration Chip (e.g. 3 Days) and Price Recalculates Dynamically
    Renter->>Modal: Click Proceed to Instant Razorpay Checkout
    alt User is Demo or Guest
        Modal->>Renter: Display Auth Warning (Register, Login or Continue as Demo)
    else User is Registered Renter
        Modal->>Checkout: Navigate to /renter/rent/:id with start, end and days params
    end
---

### 2. Dual-Layer PIN + Acoustic Voice Consent Handover Flow

```mermaid
sequenceDiagram
    autonumber
    participant Renter as Renter (Dashboard)
    participant Owner as Owner (Dashboard)
    participant Server as Handover & PIN Engine
    participant Escrow as Razorpay Escrow Vault
    participant Audit as Immutable Audit Log

    Note over Renter,Owner: Physical Handover at Pickup Location
    Renter->>Server: View Confirmed Booking -> Retrieve 6-Digit Delivery PIN
    Server-->>Renter: Displays PIN: [ 4 | 8 | 2 | 9 | 1 | 7 ]
    Renter->>Owner: Inspects gear & verbally provides PIN
    Owner->>Server: Enter 6-Digit PIN (PINInputModal)
    Owner->>Server: Record Acoustic Voice Statement ("Yes, gear received in good condition")
    Server->>Server: Validate PIN hash & verify attempts < 5
    Server->>Audit: Save Acoustic Consent Audio Blob + SHA256 Handover Checksum
    Server->>Server: Transition booking_status: 'confirmed' -> 'ongoing'
    Server->>Escrow: Unlock Rental Earnings Trigger
    Escrow-->>Owner: 90% Net Rental Revenue transferred to Owner Bank Account
    Server-->>Renter: Handover certified! Rental active.
```

---

### 3. Escrow Split-Payment & AI Deposit Settlement Flow

```mermaid
sequenceDiagram
    autonumber
    participant Renter as Renter (Client)
    participant Server as Rentora Backend
    participant Razorpay as Razorpay Gateway
    participant AdminEscrow as Rentora Platform Escrow
    participant Gemini as Google Gemini 1.5 Flash
    participant Owner as Owner Account

    Note over Renter,Server: 1. Booking Confirmation Phase
    Renter->>Server: Request Booking (Clean dates, 0 client markup)
    Server->>Server: Server validates daily/weekly/monthly rates
    Owner->>Server: Owner Approves Booking Request
    Renter->>Server: Initiate Payment (createOrder)
    Server->>Razorpay: Create Escrow Order (Deposit + Rental Fee)
    Renter->>Razorpay: Completes Checkout via UPI/Card
    Razorpay-->>AdminEscrow: 100% Funds Collected into Admin Escrow Account
    Server->>Server: Atomically set payment_status='paid', booking_status='confirmed'

    Note over Renter,Owner: 2. Rental Execution & Handover Phase
    Renter->>Server: Upload Handover Condition Photos
    Owner->>Server: Verify 6-Digit PIN + Acoustic Voice Consent
    Server->>Server: Status transitions to 'ongoing' -> Owner Payout Disbursed

    Note over Renter,Gemini: 3. Return & Autonomous AI Inspection Phase
    Renter->>Server: Upload Return Condition Photos
    Owner->>Server: Verify 6-Digit Return PIN
    Server->>Gemini: Inspect Photos (Handover vs Return Pixel Diff)
    Gemini-->>Server: Inspection Report (Tier 0-3, Damage Cost, Findings)

    alt Tier 0: No Damage (Clean Return)
        Server->>Razorpay: Trigger Full Deposit Refund (razorpay.payments.refund)
        Razorpay-->>Renter: ₹10,000 Deposit Refunded to original UPI/Card
        Server->>AdminEscrow: Retain 10% Platform Fee in Admin Account
    else Tier 1/2: Damage Detected (Repair Deduction)
        Server->>Razorpay: Refund remaining deposit (Deposit - Repair Cost)
        Razorpay-->>Renter: Partial Deposit Refunded
        Server->>Owner: Compensate Repair Cost from Escrow Deposit
        Server->>AdminEscrow: Retain 10% Platform Fee
    else Tier 3: Severe Total Loss / Malicious Destruction
        Server->>Server: Trigger Autonomous Risk Guard (isBlocked=true)
        Server->>Owner: Forfeit 100% Deposit to Owner Compensation
        Server-->>Renter: Account Instantly Suspended & Quarantined
    end
```

---

### 4. Multimodal Gemini AI Vision Return Damage Inspection Pipeline

```mermaid
flowchart TD
    A["Renter uploads Return Photos at Drop-Off"] --> B["Backend retrieves Handover Photos from Cloudinary"]
    B --> C["Fetch Item Metadata (Title, Category, Deposit Value)"]
    C --> D["Compile Multimodal Request to Google Gemini 1.5 Flash"]
    D --> E["Gemini compares pixel differences, scratches, dents, fractures"]
    E --> F{"Evaluate Damage Severity"}
    
    F -- "TIER_0: No Damage" --> G["Estimated Repair Cost = ₹0"]
    G --> H["100% Security Deposit Refunded via Razorpay"]
    
    F -- "TIER_1: Minor Wear & Scuffs" --> I["Estimated Repair Cost < 30% Deposit"]
    I --> J["Deduct Repair Cost from Deposit -> Owner Compensated"]
    J --> K["Refund Remaining Balance to Renter"]
    
    F -- "TIER_2: Moderate Functional Damage" --> L["Estimated Repair Cost <= 100% Deposit"]
    L --> M["Full Deposit Allocated to Owner Repairs"]
    
    F -- "TIER_3: Severe Destruction / Total Loss" --> N["100% Deposit Forfeited to Owner"]
    N --> O["Autonomous Risk Guard Triggered"]
    O --> P["Renter Account Suspended (isBlocked = true)"]
    
    H & K & M & P --> Q["Save structured damageReport & depositSettlement to MongoDB"]
    Q --> R["Sync Audit Event to Admin Escrow Ledger"]
```

---

### 5. Hyper-Local GPS & Geo-Search Engine Flow

```mermaid
flowchart LR
    A["User Opens Explore"] --> B{"Choose Location Mode"}
    B -- "1-Click GPS" --> C["Browser Geolocation (lat, lng)"]
    C --> D["Nominatim Reverse Geocoding"]
    D --> E["Detect Locality (e.g., Indiranagar) & City (e.g., Bangalore)"]
    B -- "Select Registered City" --> E
    
    E --> F["Select Radius Filter: 5km | 10km | 20km | 50km | 100km"]
    F --> G["GET /explore?lat=..&lng=..&radius=..&city=.."]
    H["MongoDB 2dsphere $geoWithin $centerSphere Query"] <-- G
    H --> I["Haversine Formula computes precise distanceKm per item"]
    I --> J["Sort listings by proximity ascending"]
    J --> K["Render cards with '📍 Area, City' & 'X.X km away' badge"]
```

---

### 6. Booking State Machine & Lifecycle Transitions

```mermaid
stateDiagram-v2
    [*] --> PENDING: Renter submits booking request
    PENDING --> REJECTED: Owner rejects request
    PENDING --> APPROVED: Owner approves request (Dates locked)
    APPROVED --> CANCELLED: Renter cancels before payment
    APPROVED --> CONFIRMED: Renter locks Escrow Deposit via Razorpay
    CONFIRMED --> ONGOING: Handover photos uploaded + 6-digit PIN & Voice Consent verified
    ONGOING --> COMPLETED: Return photos uploaded + 6-digit PIN verified + AI inspected
    COMPLETED --> SETTLED: Deposit refunded / Owner earnings disbursed
    SETTLED --> [*]: Ratings & Reviews unlocked
    REJECTED --> [*]: Dates released
    CANCELLED --> [*]: Dates released
```

---

## 🛠️ Complete 24-Feature Marketplace Catalog

### 🧑‍💼 Renter Features (8)
1. **Autonomous Voice-to-Booking Agent**: Speak naturally in Hinglish, Hindi, or English to search active inventory, validate dates, and build an instant booking card without typing.
2. **Interactive Date Picker & Live Escrow Calculator**: Select custom start dates and duration chips (`1D`, `2D`, `3D`, `1 Week`) with real-time recalculation of daily rent and refundable security deposit.
3. **Location-Aware Geospatial Discovery**: Discover verified cameras, drones, tools, and bikes in your immediate neighborhood using browser GPS and MongoDB `2dsphere` spatial indexing.
4. **1-Click Razorpay Escrow Protection**: Rent and refundable deposits are locked safely in an automated escrow vault; owners receive zero funds until verified handover.
5. **6-Digit Delivery Handover PIN**: One-time cryptographic PIN generated inside the renter dashboard. Handover cannot be falsely claimed without this PIN.
6. **Real-Time Live Chat with Owners**: Isolated Socket.io WebSocket rooms for instant gear inquiries, accessory confirmation, and pickup coordination.
7. **Transparent Booking Lifecycle Tracker**: State machine tracking through unambiguous stages: `Requested → Approved → Escrow Locked → Active Rental → Returned → Deposit Refunded`.
8. **Wishlist & Equipment Bookmarking**: Save high-demand cameras and equipment to a personal collection for upcoming shoots and trips.

### 💼 Owner Features (7)
1. **1-Minute Asset Listing & Photo Management**: Cloudinary-backed multi-photo listing wizard with condition tagging, category assignment, and usage guidelines in under 60 seconds.
2. **Custom Rental Rates & Refundable Deposit Controls**: Define tiered daily, weekly, and monthly rates alongside mandatory damage security deposits.
3. **Physical Handover PIN & Acoustic Voice Verification**: Owner enters the renter's secret PIN and captures acoustic voice consent at pickup for 100% dispute elimination.
4. **Automated Escrow Bank Payouts**: Zero-delay revenue disbursement routed directly into the owner's linked bank account once handover verification is certified.
5. **Booking Request Management & Profile Approval**: Full owner autonomy to review renter profiles, requested rental dates, and projected earnings before approval.
6. **Live Earnings & Inventory Utilization Dashboard**: Real-time revenue metrics, active rental counters, equipment utilization percentages, and payout history.
7. **Owner Guided Indic AI Audio Tour**: Synchronized audio guide in 11 Indian languages that points to and highlights dashboard boxes in real time.

### 🛡️ Platform & AI Security Features (9)
1. **Sarvam AI Indic Voice Engine (11 Languages)**: Saaras STT and Bulbul TTS integration supporting Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, Odia, and English.
2. **Dual-Layer Anti-Fraud Handover Architecture**: Cryptographic 6-digit PIN combined with timestamped acoustic voice recording stored in immutable audit trails.
3. **Role-Based Access Control (RBAC) & Layout Isolation**: Strict route guards and layout trees segregating Guest, Renter, Owner, and Admin governance with auto-redirects.
4. **Admin Governance & Escrow Dispute Portal**: Dedicated management portal for platform GMV tracking, escrow dispute arbitration, and item moderation.
5. **Dual Search Engine with Zero-Downtime Fallback**: Elasticsearch fuzzy query cluster with automated instant failover to MongoDB regex search.
6. **Enterprise Multi-Layer Web Security**: HTTP-only cookies, Redis token blacklisting on logout, double CSRF verification, rate limiting, and bcrypt hashing.
7. **BullMQ & Redis Background Task Queues**: Asynchronous worker queues offloading heavy email notifications, photo purging, and expired booking transitions.
8. **Centralized Server-Side Pricing Engine**: Tamper-proof calculator preventing client-side amount manipulation before Razorpay order generation and HMAC signing.
9. **Real-Time WebSocket Engine (Socket.io)**: Sub-second live booking status updates, typing indicators, and instant notifications.

---

## 💻 Tech Stack Summary

### Backend
| Technology | Version / Purpose |
|---|---|
| **Node.js + TypeScript** | Strongly typed, enterprise server runtime |
| **Express.js** | Modular REST API and middleware pipeline |
| **Sarvam AI** | Indic Voice AI: Saaras STT (`saaras:v4`) & Bulbul TTS (`bulbul:v2`) in 11 languages |
| **Google Gemini 1.5 Flash** | Multimodal computer vision AI damage inspection |
| **MongoDB + Mongoose** | Document database with 2dsphere spatial indexing |
| **Redis 7** | BullMQ queue broker, token blacklist, audio cache, and geocoder caching |
| **BullMQ** | Reliable asynchronous job and delay queue management |
| **Razorpay SDK** | Payment orders, escrow payouts, and automated refunds |
| **Elasticsearch v8** | High-performance full-text fuzzy search engine |
| **Socket.io v4** | Bidirectional real-time messaging and notifications |
| **Cloudinary SDK** | Cloud image storage, transformations, and asset purging |
| **Resend** | Transactional email delivery for OTP verification |
| **Sentry APM** | Exception tracking and session performance profiling |
| **Zod** | Runtime schema and payload validation |

### Frontend
| Technology | Version / Purpose |
|---|---|
| **React 18** | Declarative component UI library |
| **Vite 7** | High-speed frontend build tool and dev server |
| **React Router v7** | Client-side routing with nested role-based guards |
| **Tailwind CSS** | Custom responsive styling with dark-mode theme |
| **Web Audio & MediaRecorder API** | In-browser microphone audio capture and WAV playback |
| **Lucide React** | Clean iconography system |
| **Socket.io Client** | Real-time WebSocket connection handling |
| **React Hot Toast** | Dynamic, accessible user feedback alerts |

---

## 📁 Directory Structure

```
Rentora/
├── backend/
│   ├── src/
│   │   ├── config/          # Redis, Socket.io, Mongoose, Cloudinary, Razorpay, Logger config
│   │   ├── controllers/     # HTTP controllers (admin, auth, booking, items, payments, voice)
│   │   ├── middlewares/     # verifyUser, restrictTo, double-submit CSRF, upload, rateLimiter
│   │   ├── models/          # Schemas: User, Item, Booking, Payment, Message, Review, Notification
│   │   ├── payments/        # Strategy Pattern: IPaymentProvider & RazorpayPaymentProvider
│   │   ├── queues/          # BullMQ queue producers (email, status, ES sync, photo purge)
│   │   ├── routes/          # Express route declarations (admin, auth, booking, explore, items, voice)
│   │   ├── service/         # Domain business services (ai, booking, explore, items, payment, voice, voiceAgent)
│   │   ├── utils/           # Geocoder, pricing calculator, AppError
│   │   ├── validators/      # Zod validation schemas
│   │   ├── workers/         # BullMQ queue consumers & background processors
│   │   ├── app.ts           # Express application configuration
│   │   └── server.ts        # Bootstrap entrypoint for HTTP & Socket.io
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static brand icons and images
│   │   ├── components/      # UI components (admin_ui, owner_ui, renter_ui, guest_ui, common)
│   │   │   ├── common/      # VoiceBookingAgentModal, VoiceWelcomeWidget, PINDisplayModal, PINInputModal
│   │   │   ├── owner_ui/    # OwnerVoiceGuide, QuickActions, StatsCard, RentalSection
│   │   │   ├── renter_ui/   # RenterVoiceGuide, ExploreSearchBar, RentCheckoutLayout, RentalCalendar
│   │   ├── context/         # Socket and Auth React contexts
│   │   ├── hooks/           # Custom React hooks (useAuth, apiClient, homeRedirect)
│   │   ├── layouts/         # Layout wrappers (AdminLayout, GuestLayout, OwnerLayout, RenterLayout)
│   │   ├── modals/          # AddItemModal, EditItemModal, AddReviewModal, AuthController, ProfileModal
│   │   ├── pages/           # Pages (guest/Features, admin/AdminDashboard, owner/OwnerDashboard, etc.)
│   │   ├── App.jsx          # Route definitions & ProtectedRoute wrapper
│   │   └── main.jsx         # Client mount entrypoint
```

---

## 🔒 Security Architecture

| Security Layer | Implementation Details |
|---|---|
| **Authentication** | Access Token (15 min) + Refresh Token (7 days) stored in HTTP-Only, SameSite cookies |
| **Token Invalidation** | Redis-backed token blacklist; instant session termination on logout |
| **CSRF Defense** | Double-submit cookie pattern verified with constant-time `crypto.timingSafeEqual` |
| **Autonomous Risk Guard** | Auto-suspension (`isBlocked=true`) triggered by AI on severe item damage |
| **Dual-Layer Handover** | 6-digit numeric PIN with 1-hour TTL + Acoustic Voice Consent Recording stored in audit logs |
| **Input Sanitization** | Strict Zod validation on every request body, query param, and path parameter |
| **Rate Limiting** | `express-rate-limit` prevents brute force on auth, voice, and sensitive endpoints |
| **HTTP Hardening** | Helmet headers (CSP, HSTS, X-Frame-Options) and strict CORS origin checks |
| **Error Monitoring** | Sentry APM integration with automated 500 exception capture and user tracing |

---

## 🔑 Environment Configuration

### Backend Configuration (`backend/.env`)

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/Rentora?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173

# Authentication & Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
SESSION_SECRET=your_session_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cache & Queues
REDIS_URL=redis://localhost:6379

# Sarvam AI (Indic Voice Engine: Saaras STT & Bulbul TTS)
SARVAM_API_KEY=your_sarvam_api_key_here

# Google Gemini Multimodal AI (Damage Inspection)
GEMINI_API_KEY=your_gemini_api_key_here

# Payment Gateway (Razorpay Escrow)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Search Engine
ELASTIC_SEARCH_URL=http://localhost:9200
ELASTIC_API_KEY=your_elastic_key

# Transactional Email (Resend)
RESEND_API_KEY=your_resend_api_key
MAIL_USER=your_email@gmail.com

# Error Monitoring
SENTRY_DSN=your_sentry_dsn_url
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:3000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

## ⚡ Installation & Quick Start

### Prerequisites
- **Node.js** v18+ & **npm**
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Redis Server** (Port 6379)
- **Elasticsearch v8** *(Optional — MongoDB regex fallback activates automatically if unavailable)*
- **Sarvam AI API Key** *(For Indic Voice Agent and Audio Dashboard Guides)*

### Step 1: Clone Repository
```bash
git clone https://github.com/priyanshuraj20/Rentora.git
cd Rentora
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Populate Environment Variables
Create `.env` in both `backend/` and `frontend/` using the templates provided above.

### Step 4: Run Geocoding Migration (One-Time)
```bash
cd backend
npx ts-node -r tsconfig-paths/register src/scripts/migrateGeoCoordinates.ts
```

### Step 5: Start Development Servers
```bash
# Terminal 1: Backend Server (Port 3000)
cd backend
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧠 Design Patterns & Best Practices

1. **Clean Layered Architecture**: Clear separation of concerns: `Routes` → `Middlewares` → `Controllers` → `Services` → `Models`.
2. **Strategy Pattern**: Abstracted `IPaymentProvider` allowing seamless swapping of payment gateways (Razorpay, Stripe, etc.).
3. **State Machine Pattern**: Strict, deterministic state transitions for the booking lifecycle preventing invalid statuses or race conditions.
4. **Observer & Event-Driven Architecture**: WebSocket event dispatching decoupled from core business transactions.
5. **Decoupled Queue Architecture**: Non-blocking asynchronous job execution for media purging, emails, and catalog synchronization.
6. **Voice Biometric & Acoustic Auditability**: Cryptographic one-time PINs coupled with immutable acoustic consent recordings for zero-dispute peer handovers.

---

## 📜 License

Distributed under the **MIT License**. Created by [Priyanshu Raj](https://github.com/priyanshuraj20).
