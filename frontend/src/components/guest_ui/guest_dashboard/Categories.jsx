import { Link } from "react-router-dom";
import { ArrowRight, Laptop, Sofa, Wrench, Car } from "lucide-react";

const categories = [
  {
    title: "Electronics",
    count: "2,400+ items",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    icon: <Laptop className="size-6" />,
  },
  {
    title: "Furniture",
    count: "1,800+ items",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    icon: <Sofa className="size-6" />,
  },
  {
    title: "Tools",
    count: "4,200+ items",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    icon: <Wrench className="size-6" />,
  },
  {
    title: "Vehicles",
    count: "850+ items",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    icon: <Car className="size-6" />,
  },
];

export default function Categories() {
  return (
    <section
      id="categories"
      className="py-16 scroll-mt-24 border-t border-divider bg-[#0c0e11]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary leading-tight mb-4 tracking-tight">
              Explore What's Near You
            </h2>
            <p className="text-text-secondary text-lg font-medium opacity-80 max-w-xl">
              Discover high-quality items available immediately in your neighborhood.
            </p>
          </div>
          <Link
            to="/explore"
            className="group flex items-center gap-3 bg-white/5 border border-white/10 text-primary px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:bg-primary hover:text-app hover:shadow-[0_0_20px_rgba(47,183,164,0.3)] shadow-xl"
          >
            View All Categories
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-0">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to="/explore"
              className="group relative h-[300px] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-[800ms] hover:scale-[1.03] hover:border-primary/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]"
            >
              {/* Image with zoom effect */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />

              {/* Dynamic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-700 opacity-90 group-hover:opacity-75" />

              {/* Cyan radial glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(47,183,164,0.1),transparent_70%)]" />

              {/* Card Content Container */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-700 group-hover:-translate-y-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/10 backdrop-blur-xl border border-white/10 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-app shadow-2xl">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-1 tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-[10px] font-black tracking-[0.25em] uppercase text-text-muted group-hover:text-white/80 transition-colors">
                  {cat.count}
                </p>
              </div>

              {/* Hover indicator link button (bottom corner) */}
              <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md opacity-0 transform translate-x-4 transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-0 flex items-center justify-center">
                <ArrowRight size={20} className="text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
