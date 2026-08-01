import { Link } from "react-router-dom";
import { ArrowRight, Laptop, Sofa, Wrench, Car } from "lucide-react";

const categories = [
  {
    title: "Electronics",
    count: "2,400+ items",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    icon: <Laptop className="size-5" />,
  },
  {
    title: "Furniture",
    count: "1,800+ items",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    icon: <Sofa className="size-5" />,
  },
  {
    title: "Tools",
    count: "4,200+ items",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    icon: <Wrench className="size-5" />,
  },
  {
    title: "Vehicles",
    count: "850+ items",
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
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-text-primary leading-tight mb-3 tracking-tight">
              Explore What's Near You
            </h2>
            <p className="text-text-secondary text-base font-normal">
              Discover high-quality items available immediately in your neighborhood.
            </p>
          </div>
          <Link
            to="/explore"
            className="group flex items-center gap-2 bg-card border border-divider text-text-primary px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:border-primary/40 hover:bg-white/5 shadow-sm"
          >
            View All Categories
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 text-primary" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to="/explore"
              className="group relative h-[320px] rounded-2xl overflow-hidden border border-divider shadow-lg transition-all duration-500 hover:-translate-y-1 hover:border-primary/30"
            >
              {/* Image with subtle zoom effect */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Dynamic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1613] via-[#1a1613]/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />

              {/* Card Content Container */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 group-hover:-translate-y-1">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 bg-surface/80 border border-white/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-text-primary">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-1 tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
