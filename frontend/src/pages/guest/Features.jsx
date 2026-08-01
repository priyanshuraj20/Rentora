import { Link } from "react-router-dom";
import { 
  MapPin, Search, MessageSquare, CreditCard, ShieldCheck, Zap, 
  Layers, Lock, Cpu, Server, ArrowRight
} from "lucide-react";

const statsLine = [
  "40+ Production Features",
  "Real-Time Socket.io",
  "Redis & BullMQ Queues",
  "Razorpay HMAC Secured",
  "Location GeoJSON Engine"
];

const featureCategories = [
  {
    id: "location",
    span: "col-span-12",
    icon: <MapPin className="size-6 text-primary" />,
    title: "Location-Aware Geospatial Discovery",
    badge: "Geospatial Engine",
    problem: "Users shouldn't waste time looking at rental items located 300km away in another city.",
    solution: "Rentora uses browser GPS + MongoDB 2dsphere indexing and the Haversine distance formula to calculate exact distances to nearby rentals dynamically.",
    flow: ["GPS Sensor", "Lat/Lng Coordinates", "MongoDB 2dsphere", "Haversine Distance", "Nearby Rentals"],
    tech: ["MongoDB 2dsphere", "Haversine Formula", "Geolocation API", "GeoJSON"],
  },
  {
    id: "search",
    span: "col-span-12 md:col-span-6",
    icon: <Search className="size-6 text-secondary-accent" />,
    title: "Smart Search & Zero-Downtime Fallback",
    badge: "Elasticsearch + Mongo",
    problem: "External search clusters can experience temporary outages or indexing delays.",
    solution: "High-performance Elasticsearch fuzzy search with automated instant failover to MongoDB regex search if Elasticsearch is offline.",
    flow: ["User Query", "Elasticsearch Cluster", "(Outage Failover)", "MongoDB Regex", "Instant Results"],
    tech: ["Elasticsearch", "MongoDB Regex", "BullMQ Sync"],
  },
  {
    id: "payments",
    span: "col-span-12 md:col-span-6",
    icon: <CreditCard className="size-6 text-success" />,
    title: "Secure Razorpay Payments & Pricing Engine",
    badge: "Server-Side Pricing",
    problem: "Malicious clients can tamper with checkout amounts sent over the network.",
    solution: "Centralized server-side pricing calculator generates Razorpay orders. Server validates HMAC SHA256 signatures before confirming bookings.",
    flow: ["Booking Request", "Server Amount Calc", "Razorpay HMAC", "Signature Verify", "Confirmed"],
    tech: ["Razorpay API", "HMAC SHA256", "Centralized Engine"],
  },
  {
    id: "chat",
    span: "col-span-12 md:col-span-4",
    icon: <MessageSquare className="size-6 text-primary" />,
    title: "Real-Time Chat & Live Notifications",
    badge: "Socket.io WebSockets",
    problem: "Delayed communication causes lost rental requests and slow owner responses.",
    solution: "JWT-authenticated Socket.io room isolation allows instant messaging between renters and owners with live unread badges.",
    flow: ["JWT Auth", "User Room", "Socket.io Event", "Live Notification"],
    tech: ["Socket.io", "JWT Rooms", "Event Bus"],
  },
  {
    id: "booking",
    span: "col-span-12 md:col-span-4",
    icon: <Layers className="size-6 text-secondary-accent" />,
    title: "Booking Lifecycle State Machine",
    badge: "Strict Workflow",
    problem: "Complex rental states can lead to invalid order transitions.",
    solution: "A state machine enforces strict role-based transitions: Request → Owner Approval → Payment Pending → Confirmed → Completed.",
    flow: ["Request", "Approved", "Payment", "Ongoing", "Completed"],
    tech: ["State Machine", "Role Guards", "Audit Logs"],
  },
  {
    id: "security",
    span: "col-span-12 md:col-span-4",
    icon: <Lock className="size-6 text-error" />,
    title: "Enterprise Multi-Layer Security",
    badge: "Token Blacklist",
    problem: "Stolen JWT tokens can remain active even after a user logs out.",
    solution: "HTTP-only cookie auth with Redis Refresh Token Blacklisting, double CSRF verification, rate limiting, and bcrypt hashing.",
    flow: ["HTTP Cookie", "Redis Blacklist", "CSRF Verification", "Protected API"],
    tech: ["Redis Blacklist", "Double CSRF", "Bcrypt", "Zod"],
  },
  {
    id: "queue",
    span: "col-span-12 md:col-span-6",
    icon: <Cpu className="size-6 text-secondary-accent" />,
    title: "BullMQ & Redis Background Queues",
    badge: "Async Processing",
    problem: "Sending emails or syncing search indexes synchronously slows down API responses.",
    solution: "BullMQ background queues push heavy operations to Redis workers for non-blocking execution and automated retry logic.",
    flow: ["API Action", "BullMQ Job", "Redis Worker Queue", "Resend Email"],
    tech: ["BullMQ", "Redis Workers", "Resend API"],
  },
  {
    id: "architecture",
    span: "col-span-12 md:col-span-6",
    icon: <Server className="size-6 text-primary" />,
    title: "Modular Controller-Service Architecture",
    badge: "Clean Codebase",
    problem: "Monolithic controller code becomes unmaintainable as business logic grows.",
    solution: "Decoupled Service Layer architecture separates HTTP handlers, business logic, MongoDB queries, and React Query frontend caching.",
    flow: ["Routes", "Controllers", "Service Layer", "MongoDB Models"],
    tech: ["Clean Architecture", "React Query", "Tailwind CSS"],
  },
];

export default function Features() {
  return (
    <div className="bg-app min-h-screen py-16 px-6 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">

        {/* ================= Header Section ================= */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[76px] font-normal text-text-primary tracking-tight mb-6 leading-[1.05]">
            Everything Built Into <br />
            <span className="italic bg-gradient-to-r from-primary via-secondary-accent to-primary bg-clip-text text-transparent">
              Rentora Marketplace
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-secondary leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
            Rentora is an end-to-end, location-aware peer-to-peer rental marketplace built with enterprise security, WebSockets, BullMQ job queues, and zero-downtime search.
          </p>

          {/* Inline Stats Line (No Boxes!) */}
          <div className="flex items-center justify-center gap-3 flex-wrap text-xs font-semibold text-text-muted">
            {statsLine.map((stat, idx) => (
              <span key={idx} className="flex items-center gap-3">
                <span className="text-text-primary font-bold">{stat}</span>
                {idx < statsLine.length - 1 && <span className="text-primary">•</span>}
              </span>
            ))}
          </div>

        </div>

        {/* ================= Features Grid ================= */}
        <div className="grid grid-cols-12 gap-8 mb-20">
          {featureCategories.map((item) => (
            <div
              key={item.id}
              className={`${item.span} bg-surface border border-divider rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-app border border-divider flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 tracking-tight">
                  {item.title}
                </h3>

                {/* Editorial Problem & Solution Text (NO nested inner boxes!) */}
                <div className="space-y-2 mb-6 text-sm leading-relaxed">
                  <p className="text-text-secondary">
                    <span className="font-bold text-error uppercase text-[11px] tracking-wider mr-2">Problem Solved:</span>
                    {item.problem}
                  </p>
                  <p className="text-text-primary font-normal">
                    <span className="font-bold text-primary uppercase text-[11px] tracking-wider mr-2">Rentora Solution:</span>
                    {item.solution}
                  </p>
                </div>

                {/* Inline System Flow (NO nested inner boxes!) */}
                <div className="mb-6 pt-4 border-t border-divider">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">
                    System Architecture Flow
                  </span>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-text-primary font-medium">
                    {item.flow.map((step, idx) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span>{step}</span>
                        {idx < item.flow.length - 1 && (
                          <span className="text-primary font-bold">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Tech List */}
              <div className="pt-4 border-t border-divider flex flex-wrap gap-2 text-xs font-medium text-text-muted">
                {item.tech.map((t, idx) => (
                  <span key={idx} className="bg-app border border-divider text-text-primary text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ================= Bottom CTA ================= */}
        <div className="bg-surface border border-divider rounded-2xl p-10 md:p-14 text-center relative overflow-hidden shadow-xl mb-16">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-text-primary mb-4 tracking-tight">
              Ready to Explore Nearby Gear?
            </h2>
            <p className="text-base text-text-secondary mb-8 leading-relaxed font-normal">
              Find items listed near you, compute instant rental costs, or list your own gear to start earning today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/explore"
                className="group bg-primary text-text-primary px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-hover active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Browse Nearby Items
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
