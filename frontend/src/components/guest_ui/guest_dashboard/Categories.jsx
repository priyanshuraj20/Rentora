import { Link } from "react-router-dom";
import { ArrowRight, Camera, Sofa, Wrench, Car, Sparkles } from "lucide-react";

const categories = [
  {
    title: "Electronics",
    subtitle: "Cameras, Drones & Audio Gear",
    description: "DSLRs, 4K drones, gimbals, podcasts mics & studio lighting for shoots.",
    badge: "Creators & Shoots",
    tags: ["Sony & Canon", "DJI Drones", "Audio Rigs"],
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    icon: <Camera className="size-5" />,
  },
  {
    title: "Furniture",
    subtitle: "Desks, Ergonomic Chairs & Living",
    description: "Standing desks, Herman Miller chairs & event staging without buying upfront.",
    badge: "Flexible Workspaces",
    tags: ["Standing Desks", "Ergo Chairs", "Event Sets"],
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    icon: <Sofa className="size-5" />,
  },
  {
    title: "Tools",
    subtitle: "Power Drills, Saws & Equipment",
    description: "Cordless drills, rotary saws, pressure washers & DIY repair machinery.",
    badge: "DIY & Construction",
    tags: ["DeWalt / Bosch", "Rotary Saws", "Washers"],
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    icon: <Wrench className="size-5" />,
  },
  {
    title: "Vehicles",
    subtitle: "Motorcycles, Scooters & E-Bikes",
    description: "Cruisers, city electric scooters & bikes for weekend trips & daily commutes.",
    badge: "Inspected & Verified",
    tags: ["Touring Bikes", "E-Scooters", "City Commuters"],
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    icon: <Car className="size-5" />,
  },
];

export default function Categories() {
  return (
    <section
      id="categories"
      className="py-20 scroll-mt-24 border-t border-divider bg-surface"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary leading-tight mb-3 tracking-tight">
              Explore More. Own Less.
            </h2>
            <p className="text-text-secondary text-base font-normal">
              From everyday tools to high-end creator gear, rent verified equipment from trusted local owners across your city.
            </p>
          </div>
          <Link
            to="/explore"
            className="group flex items-center gap-2 bg-card border border-divider text-text-primary px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:border-primary/40 hover:bg-white/5 shadow-sm shrink-0"
          >
            View All Categories
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 text-primary" />
          </Link>
        </div>

        {/* Categories Grid - Static Showcase Preview Cards (No navigation on card click, dedicated top button only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="group relative h-[380px] rounded-2xl overflow-hidden border border-divider/80 bg-card shadow-lg transition-all duration-300 hover:border-primary/40 cursor-default flex flex-col justify-between p-6"
            >
              {/* Background Image with subtle zoom on hover */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Dynamic Gradient Overlay for contrast and readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/75 to-[#141210]/30 transition-opacity duration-300" />

              {/* Top Badge & Icon */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-primary shadow-sm">
                  {cat.icon}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/50 backdrop-blur-md border border-white/10 text-text-primary">
                  {cat.badge}
                </span>
              </div>

              {/* Bottom Details Container */}
              <div className="relative z-10 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-medium text-primary mt-0.5">
                    {cat.subtitle}
                  </p>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {cat.description}
                </p>

                {/* Popular Gear Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/10">
                  {cat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
