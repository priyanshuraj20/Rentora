import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthController from "../../auth/AuthController";
import { ArrowRight, Star, ShieldCheck, Zap, IndianRupee } from "lucide-react";

const Hero = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [realItems, setRealItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  useEffect(() => {
    const fetchHeroItems = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/explore?limit=4`);
        const data = await res.json();
        if (data.status === "success" || data.success) {
          const list = data.items || data.data || [];
          setRealItems(list.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch hero items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroItems();
  }, []);

  return (
    <section className="relative min-h-[620px] flex items-center bg-app py-12 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ================= Left Column: Hero Text ================= */}
          <div className="lg:col-span-6 xl:col-span-6 text-left flex flex-col items-start">
            
            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[72px] font-normal leading-[1.05] mb-6 tracking-tight text-text-primary">
              Don't Buy It. <br />
              <span className="italic bg-gradient-to-r from-primary via-secondary-accent to-primary bg-clip-text text-transparent pb-1 block">
                Rent It Right Next Door.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed font-normal max-w-xl">
              Borrow cameras, tools, bikes, camping gear, and more from verified neighbors in your area. Or turn your unused items into passive income.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-10">
              <Link
                to="/explore"
                className="group bg-primary text-text-primary px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-md"
              >
                Start Browsing
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() => openAuth('register')}
                className="bg-surface px-7 py-3.5 rounded-xl font-semibold text-base border border-divider hover:bg-white/5 transition-all text-text-primary active:scale-95 cursor-pointer flex items-center justify-center"
              >
                List Your Gear
              </button>
            </div>

            {/* Trust Pill Indicators */}
            <div className="flex items-center gap-6 pt-6 border-t border-divider w-full flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <ShieldCheck className="size-4 text-success" />
                <span>100% Protected</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <Zap className="size-4 text-primary" />
                <span>Instant Approval</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <Star className="size-4 text-warning fill-warning" />
                <span>4.9 Community Rating</span>
              </div>
            </div>

          </div>

          {/* ================= Right Column: Real DB Items Grid (No Outer Box) ================= */}
          <div className="lg:col-span-6 xl:col-span-6">
            
            {/* Header Title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Available Near You
                </span>
              </div>
              <Link to="/explore" className="text-xs font-semibold text-primary hover:underline">
                Explore All Items →
              </Link>
            </div>

            {/* Real Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                // Loading Skeletons
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-surface border border-divider rounded-2xl p-3 h-52 animate-pulse" />
                ))
              ) : (
                realItems.map((item) => {
                  const itemId = item._id || item.id;
                  const rawImg = (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image) || "";
                  const itemImg = (typeof rawImg === "string" && (rawImg.startsWith("http") || rawImg.startsWith("/")))
                    ? rawImg
                    : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600";
                  const itemPrice = item.dailyPrice ?? item.price?.daily ?? item.pricing?.daily ?? item.pricePerDay ?? item.price ?? 0;
                  const itemRating = item.avgRating || item.rating || (item.reviewsCount > 0 ? 4.9 : "New");
                  const reviewCount = item.totalReviews || item.reviewsCount || item.reviews || 0;

                  return (
                    <Link
                      key={itemId}
                      to={`/item/${itemId}`}
                      className="group bg-surface border border-divider rounded-2xl p-3 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-sm"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-card border border-divider">
                        <img
                          src={itemImg}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.category && (
                          <span className="absolute top-2 left-2 bg-app/80 text-text-primary text-[10px] font-bold px-2 py-0.5 rounded-md border border-divider uppercase tracking-wider">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <h4 className="text-xs font-bold text-text-primary tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-divider">
                          <span className="text-[10px] text-text-muted flex items-center gap-1 font-medium">
                            <Star className="size-3 text-warning fill-warning" />
                            {itemRating} {reviewCount > 0 ? `(${reviewCount})` : ''}
                          </span>

                          <span className="text-xs font-bold text-primary flex items-center">
                            <IndianRupee className="size-3" />
                            {itemPrice}
                            <span className="text-[9px] text-text-muted font-normal ml-0.5">/day</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

          </div>

        </div>
      </div>

      <AuthController
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />
    </section>
  );
};

export default Hero;