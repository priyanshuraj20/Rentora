# Rentora — Peer-to-Peer Rental Marketplace

Rentora is a location-aware P2P rental marketplace built with Node.js/TypeScript, React, MongoDB, Redis, BullMQ, Socket.io, Elasticsearch, and Razorpay. It enables item owners to list unused assets (cameras, tools, vehicles, camping gear) and renters to discover and book them from nearby verified users.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Key Engineering Components](#key-engineering-components)
- [Feature List](#feature-list)
- [System Architecture Diagram](#system-architecture-diagram)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Business Lifecycles](#core-business-lifecycles)
- [Security Implementation](#security-implementation)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Design Patterns](#design-patterns)

## Architecture Overview

| Component | Implementation |
|---|---|
| Location-Aware Discovery | Nominatim API geocoding + Redis caching + Haversine formula + MongoDB 2dsphere indexing |
| Photo Evidence Lifecycle | Handover/return condition uploads with 3-day automated Cloudinary purge via BullMQ delay queues |
| Search | Elasticsearch fuzzy search with automatic MongoDB regex fallback |
| Real-Time Chat | JWT-authenticated Socket.io room isolation per booking, with message acknowledgment handling |
| Payments | Server-side amount calculation, HMAC SHA256 signature verification, idempotency guards |
| Async Job Queues | BullMQ + Redis for emails, Elasticsearch sync, evidence purge, and booking status transitions |
| Security | JWT + refresh token blacklist + double CSRF protection + bcrypt + account suspension (`isBlocked`) |
| Architecture | Controller → Service → Model separation with a centralized pricing engine |
| Notifications | Real-time Socket.io delivery with unread badge counts |

## Feature List

### Authentication & User Management
- Email registration with bcrypt password hashing and OTP email verification
- Google OAuth (login + register, flow-aware)
- JWT authentication: access token (15 min) + refresh token (7 days) in HTTP-only cookies
- Refresh token rotation without forced re-login
- Redis-backed token blacklist on logout — invalidated refresh tokens cannot be reused
- Double CSRF protection: secret cookie + `X-CSRF-Token` header with timing-safe comparison
- Role-based access control: Guest, Renter, Owner, Admin, enforced via middleware
- Profile management: name, phone, profile image, address, city, district, state, pincode

### Admin Controls & Account Suspension
- `isBlocked` flag checked during JWT verification; blocked users receive `403 Forbidden` and cannot log in or use the marketplace
- Admin management API: `PATCH /user/:id/block` and `PATCH /user/:id/activate`, restricted to `admin` role

### Photo Evidence & Auto-Purge Lifecycle
- Return condition photos are mandatory before an owner can mark a booking complete (`PATCH /booking/:id/photos`)
- Pickup condition photos are optional, uploaded by renters at handover
- Uploading return photos schedules a BullMQ delay job (`photoPurgeQueue`); after 3 days, `photoPurgeWorker` destroys the Cloudinary assets and clears the DB photo arrays

### Item Listing System (Owners)
- Add/edit/delete items: title, category, description, multiple images (Cloudinary), pricing, deposit, availability, pickup location
- Pause/resume listing visibility on Explore
- New listings automatically inherit the owner's saved profile location

### Location-Aware Discovery (Geospatial Engine)
- Browser Geolocation API with permission handling, or manual city selection
- Radius filter: 5/10/20/50/100 km
- Haversine-calculated distance shown per listing
- MongoDB `2dsphere` index with `$geoWithin $centerSphere` queries
- Location persisted in LocalStorage across navigations

### Smart Search
- Elasticsearch fuzzy search across item title, category, and description
- Automatic MongoDB regex fallback if Elasticsearch is unavailable
- Combined search + location filters
- BullMQ pipeline syncs listing changes to the Elasticsearch index asynchronously

### Wishlist
- Add/remove items, persistent across sessions

### Booking Lifecycle (State Machine)

| Status | Description |
|---|---|
| `PENDING` | Renter sends request |
| `APPROVED` | Owner approves, dates blocked |
| `REJECTED` | Owner or system rejects |
| `CONFIRMED` | Renter completes payment |
| `ONGOING` | Rental started (auto-transitioned by BullMQ worker) |
| `COMPLETED` | Rental returned |
| `CANCELLED` | Cancelled by renter or owner |

- Strict role-based state transitions
- Double-booking prevented via date locking on approval

### Centralized Pricing Engine
- Computes rental amount, platform fee (10%), owner earning, and total
- Single source of truth — client never sends amounts; server always calculates and validates

### Razorpay Payment Integration
- Server-side order creation
- HMAC SHA256 signature verification before confirming booking
- Ownership validation on payment confirm
- Idempotency guards reject duplicate payments
- Atomic transition of booking to `CONFIRMED` on payment success

### Real-Time Chat (Socket.io)
- JWT-authenticated WebSocket connections
- Room-based isolation — each booking has its own chat room
- Live message delivery, unread message handling
- Direct owner-renter messaging

### Notification System
- Real-time Socket.io notifications for booking requests, approvals/rejections, payments, new messages, and listing updates
- Persistent notification bell with unread badge count, mark-all-as-read, direct navigation to the relevant resource

### Ratings & Reviews
- One review per completed booking, enforced server-side
- Star rating (1–5) + optional text
- Item's average rating recalculated in real time after each submission

### Image Upload (Cloudinary)
- Multiple images per listing, optimized CDN delivery, URLs stored in MongoDB

### Background Job Processing (BullMQ + Redis)

| Queue | Purpose |
|---|---|
| Email Queue | OTP, booking accepted/cancelled emails via Resend |
| Elasticsearch Sync | Async index updates on listing create/update/delete |
| Booking Status Worker | Auto-transition bookings to `ongoing`/`completed` by date |
| Photo Purge Queue | 3-day delayed deletion of evidence photos from Cloudinary & DB |

- Automatic retry handling for failed jobs
- Redis-backed concurrency management
- Non-blocking — API responses are never delayed by background work

### Email System (Resend)
- OTP verification, booking accepted, booking cancelled emails
- Extendable to password reset, payment receipts, review reminders

### Owner Dashboard
- Overview of total listings, active bookings, pending requests
- Earnings analytics: gross earnings, platform fees, net payouts
- Inventory management with pause/resume, booking approval workflow

### Renter Dashboard
- Active rental tracking, rental history, wishlist management, message inbox, review management

## System Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer["Frontend Layer (React + Vite + Tailwind)"]
        Client["Client App"]
        SocketClient["Socket.io Client"]
    end
    subgraph SecurityGateway["API Gateway & Security Controls"]
        API["Express HTTP Server (TypeScript)"]
        Auth["JWT + CSRF Guard + isBlocked Guard"]
    end
    subgraph ServiceLayer["Domain Services & Engines"]
        GeoEngine["Geocoder (Nominatim + Redis Cache)"]
        PricingEngine["Centralized Pricing Engine"]
    end
    subgraph AsyncQueues["Background Job Queues (BullMQ)"]
        Queue["BullMQ Queue Manager"]
        PurgeWorker["Photo Purge Worker (3-Day Retention)"]
        BookingWorker["Booking Status Worker"]
        ESWorker["Elasticsearch Sync Worker"]
    end
    subgraph InfraStorage["Persistence & External Services"]
        DB[("MongoDB (2dsphere Spatial)")]
        Cache[("Redis Cache / Blacklist / Queue Broker")]
        ES[("Elasticsearch Engine")]
        Cloudinary["Cloudinary CDN"]
        Razorpay["Razorpay Gateway"]
        SocketServer["Socket.io Realtime Gateway"]
    end
    Client -->|HTTPS API Requests| API
    SocketClient <-->|WebSockets| SocketServer
    API --> Auth
    Auth --> DB
    API --> GeoEngine
    GeoEngine -- "Cache / Rate Limit" --> Cache
    GeoEngine --> DB
    API --> PricingEngine
    API -->|Async Jobs| Queue
    Queue -->|Redis Connection| Cache
    Queue -->|Sync Index| ESWorker --> ES
    Queue -->|Photo Purge| PurgeWorker --> Cloudinary & DB
    Queue -->|Auto Transition| BookingWorker --> DB
    API -->|Upload Evidence & Listing Media| Cloudinary
    API -->|Verify Signature| Razorpay
    SocketServer -->|Persist Messages| DB
    SocketServer -->|Emit Notifications| SocketClient
```

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime & type safety |
| Express.js | HTTP server framework |
| MongoDB + Mongoose | Primary database with 2dsphere spatial indexing |
| Redis | Refresh token blacklist, BullMQ broker |
| BullMQ | Background job queue processing |
| Elasticsearch v8 | Full-text fuzzy search engine |
| Socket.io v4 | Real-time bidirectional WebSocket communication |
| Razorpay Node SDK | Payment gateway integration |
| Cloudinary Node SDK | Image upload and CDN delivery |
| Resend | Transactional email delivery |
| Zod | Schema validation |
| bcrypt | Password hashing |
| Helmet + CORS | HTTP security headers |
| express-rate-limit | API rate limiting |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework with fast HMR |
| React Router v7 | Client-side routing with protected routes |
| Tailwind CSS | Utility-first responsive styling |
| Lucide React | Icon system |
| Socket.io Client | WebSocket connections |
| React Hot Toast | User feedback notifications |
| Browser Geolocation API | GPS location detection |

## Project Structure

```
Rentora/
├── backend/
│   ├── src/
│   │   ├── config/          # Redis, Socket.io, Mongoose, Cloudinary, Razorpay config
│   │   ├── controllers/     # HTTP request/response orchestrators
│   │   ├── middlewares/     # Auth guards (verifyUser, restrictTo), CSRF, global error handler
│   │   ├── models/          # Mongoose schemas (User, Item, Booking, Message, Review, Notification)
│   │   ├── payments/        # Strategy pattern (IPaymentProvider) + Razorpay implementation
│   │   ├── queues/          # BullMQ queue producers (email, bookingStatus, elasticSync)
│   │   ├── routes/          # Express API route declarations
│   │   ├── scripts/         # Idempotent migration scripts (migrateGeoCoordinates.ts)
│   │   ├── service/         # Domain business logic (explore, items, booking, payment, review, notification)
│   │   ├── utils/           # Geocoder, pricing calculator, AppError, async wrapper, token utilities
│   │   ├── validators/      # Zod validation schemas
│   │   ├── workers/         # BullMQ consumer workers (email, booking status, ES sync)
│   │   ├── app.ts           # Express application init & middleware stack
│   │   └── server.ts        # HTTP & Socket.io server bootstrap
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static brand logos and imagery
│   │   ├── components/      # UI components (Explore, ItemCards, Navbar, Dashboards, Modals)
│   │   ├── context/         # React contexts (SocketContext)
│   │   ├── hooks/           # Custom hooks (useAuth, homeRedirect, apiClient)
│   │   ├── layouts/         # Page layout wrappers (GuestLayout, RenterLayout, OwnerLayout)
│   │   ├── modals/          # Modal components (AddReviewModal, AuthModal)
│   │   ├── pages/           # Page views (Explore, Features, ItemDetails, Dashboard, Messages, Checkout)
│   │   ├── App.jsx          # Router & protected route guards
│   │   └── main.jsx         # Vite entrypoint
```

## Core Business Lifecycles

### 1. Location-Aware Discovery & Geo-Search
```mermaid
flowchart TD
    A[Renter opens Explore] --> B{GPS Allowed?}
    B -- Yes --> C[Browser Geolocation lat/lng]
    C --> D[Nominatim Reverse Geocode -> City Name]
    B -- No --> E[User Selects City or Loads LocalStorage]
    D --> F[GET /explore?lat=..&lng=..&radius=50]
    E --> F
    F --> G[MongoDB $geoWithin $centerSphere Query]
    G --> H[Haversine distanceKm calculated per item]
    H --> I[Sort by nearest distance ascending]
    I --> J[Render items with 'X.X km away' badge]
```

### 2. Authentication & Security Flow
```mermaid
sequenceDiagram
    participant User as Renter / Owner
    participant API as Express Auth API
    participant Redis as Redis Store
    participant DB as MongoDB
    User->>API: POST /auth/login (email, password)
    API->>DB: Verify credentials & bcrypt hash
    DB-->>API: User Document
    API-->>User: Set accessToken & refreshToken (HTTP-Only Cookie)
    User->>API: GET /csrf-token
    API-->>User: X-CSRF-Token header
    User->>API: Authenticated Request + X-CSRF-Token
    API->>API: Timing-safe CSRF verification
    API-->>User: Success Response
    Note over API,Redis: On Logout — refreshToken added to Redis blacklist
```

### 3. Booking Lifecycle & State Machine
```mermaid
stateDiagram-v2
    [*] --> PENDING: Renter Submits Booking Request
    PENDING --> REJECTED: Owner Rejects Request
    PENDING --> APPROVED: Owner Approves (Dates Blocked)
    APPROVED --> CONFIRMED: Renter Pays via Razorpay
    APPROVED --> CANCELLED: Renter/Owner Cancels
    CONFIRMED --> ONGOING: Start Date Reached (BullMQ Worker)
    ONGOING --> COMPLETED: End Date Reached / Owner Marks Returned
    REJECTED --> [*]: Dates Released
    CANCELLED --> [*]: Dates Released
    COMPLETED --> [*]: Review Enabled
```

### 4. Payment Integration (Razorpay)
```mermaid
sequenceDiagram
    participant Renter
    participant API as Payment Controller
    participant Engine as Pricing Engine
    participant Razorpay as Razorpay API
    participant DB as MongoDB
    Renter->>API: POST /payments/create-order { bookingId }
    API->>Engine: Calculate totalAmount (server-side, no client input)
    Engine-->>API: rentalAmount + platformFee + deposit = total
    API->>Razorpay: createOrder(total)
    Razorpay-->>API: orderId & currency
    API->>DB: Save Payment document (status: initiated)
    API-->>Renter: Order details for Razorpay Checkout
    Renter->>Razorpay: Complete Checkout modal
    Razorpay-->>Renter: paymentId + signature
    Renter->>API: POST /payments/verify
    API->>API: Verify HMAC SHA256 signature
    API->>DB: Atomically set payment_status=paid & booking_status=confirmed
    API-->>Renter: Success + booking confirmed
```

### 5. Real-Time Chat (Socket.io)
```mermaid
sequenceDiagram
    participant Renter
    participant Owner
    participant SocketServer as Socket.io Server
    participant DB as MongoDB
    Renter->>SocketServer: Connect (JWT Cookie authentication)
    Owner->>SocketServer: Connect (JWT Cookie authentication)
    Renter->>SocketServer: join room (bookingId)
    Owner->>SocketServer: join room (bookingId)
    Renter->>SocketServer: sendMessage { text, bookingId }
    SocketServer->>DB: Persist message document
    SocketServer-->>Owner: emit message to room instantly
```

### 6. Search with Zero-Downtime Fallback
```mermaid
flowchart LR
    A[User types query] --> B[Elasticsearch Fuzzy Search]
    B -- Success --> D[Ranked results returned]
    B -- Cluster Unavailable --> C[MongoDB Regex Search fallback]
    C --> D
    D --> E[Filter by location radius]
    E --> F[Render results]
```

### 7. BullMQ Background Job Flow
```mermaid
graph LR
    A[API Action] --> B[BullMQ Job Added to Queue]
    B --> C[Redis Broker]
    C --> D{Worker picks job}
    D --> E[Email via Resend]
    D --> F[Elasticsearch Index Sync]
    D --> G[Booking Status Auto-Transition]
    D --> H[3-Day Photo Evidence Purge Worker]
    E & F & G & H --> I[Job completed / retried on failure]
```

### 8. Photo Evidence Upload & Automated Purge Lifecycle
```mermaid
sequenceDiagram
    participant Owner as Owner / Renter
    participant API as Booking API
    participant CDN as Cloudinary CDN
    participant Queue as BullMQ Delay Queue
    participant Worker as Photo Purge Worker
    participant DB as MongoDB
    Owner->>API: PATCH /booking/:id/photos (multipart FormData)
    API->>CDN: Upload evidence photos
    CDN-->>API: Return publicId & URL
    API->>DB: Save handoverPhotos / returnPhotos array
    alt type == "return"
        API->>Queue: Schedule purge-photos job (3-day delay)
    end
    API-->>Owner: 200 OK (Photos attached)
    Note over Queue,Worker: 3 Days Pass...
    Queue->>Worker: Trigger purge-photos job
    Worker->>CDN: Destroy assets by publicId
    Worker->>DB: Empty photo arrays & set evidencePurgedAt
```

## Security Implementation

| Layer | Implementation |
|---|---|
| Password Storage | bcrypt with salt rounds |
| Session Tokens | JWT access (15 min) + refresh (7 days) in HTTP-only, SameSite cookies |
| Token Invalidation | Redis-backed refresh token blacklist on logout |
| CSRF Protection | Double-submit cookie pattern with `timingSafeEqual` comparison |
| Input Validation | Zod schema validation on all routes |
| Rate Limiting | `express-rate-limit` on auth and sensitive endpoints |
| HTTP Headers | Helmet middleware (CSP, HSTS, X-Frame-Options) |
| Ownership Guards | Every mutation checks user ownership before proceeding |
| Role Enforcement | `restrictTo(role)` middleware on every protected route |
| Account Guards | `isBlocked` middleware check returning `403 Forbidden` for suspended users |
| XSS Safe Inputs | All user inputs sanitized before storage |

## Environment Variables

`backend/.env`:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/rentora
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
SESSION_SECRET=your_session_secret
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
ELASTIC_SEARCH_URL=http://localhost:9200
ELASTIC_API_KEY=your_elastic_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RESEND_API_KEY=your_resend_api_key
REDIS_URL=redis://localhost:6379
```

`frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:3000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

## Installation & Setup

### Prerequisites
- Node.js v18+ & npm
- MongoDB (local or Atlas)
- Redis server (port 6379)
- Elasticsearch v8 (optional — MongoDB fallback activates automatically if offline)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/priyanshuraj20/Rentora.git
cd Rentora
# Backend
cd backend && npm install
# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment Variables
Copy and fill in the `.env` files as described above.

### 3. Run Geocoding Data Migration (one-time, for existing data)
```bash
cd backend
npx ts-node -r tsconfig-paths/register src/scripts/migrateGeoCoordinates.ts
```

### 4. Start Development Servers
```bash
# Backend (in one terminal)
cd backend && npm run dev
# Frontend (in another terminal)
cd frontend && npm run dev
```

App runs at `http://localhost:5173`.

## Design Patterns

| Pattern | Where Applied |
|---|---|
| Service Layer | Business logic decoupled from HTTP controllers |
| Strategy Pattern | `IPaymentProvider` interface for payment gateways |
| State Machine | Booking lifecycle state transitions |
| Repository Pattern | MongoDB queries abstracted into service functions |
| Observer Pattern | Socket.io event-driven notification system |
| Queue-Based Processing | BullMQ async job execution |

## License

Distributed under the MIT License. See `LICENSE` for details.
