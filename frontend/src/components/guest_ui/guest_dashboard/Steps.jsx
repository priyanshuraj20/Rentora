import { Search, ShieldCheck, Star } from "lucide-react";

const steps = [
  {
    id: "01",
    icon: <Search className="size-6" />,
    title: "Browse & Discover",
    description:
      "Search thousands of high-quality items in your neighborhood — from professional cameras to power tools and luxury furniture.",
  },
  {
    id: "02",
    icon: <ShieldCheck className="size-6" />,
    title: "Book & Pay Securely",
    description:
      "Instantly check availability and reserve with our end-to-end encrypted checkout. Your payment is protected until pickup.",
  },
  {
    id: "03",
    icon: <Star className="size-6" />,
    title: "Return & Review",
    description:
      "Complete a seamless handback with your neighbor. Build community trust by sharing a detailed, honest review.",
  },
];

export default function Steps() {
  return (
    <section id="how-it-works" className="py-16 scroll-mt-24 border-t border-divider bg-app">
      <div className="max-w-7xl mx-auto px-6 relative z-10 transition-all duration-700">

        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-text-primary leading-[1.1] mb-5 tracking-tight">
            Three Steps to Start
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
            From browsing to earning — the whole experience is designed to be effortless.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative rounded-[30px] p-8 bg-card border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] cursor-default overflow-hidden"
            >
              {/* Giant Watermark Number */}
              <div className="absolute -top-4 -right-2 text-[140px] font-black select-none pointer-events-none leading-none opacity-[0.02] text-primary transition-all duration-700 group-hover:opacity-[0.04] group-hover:translate-x-2 group-hover:-translate-y-2">
                {step.id}
              </div>

              {/* Icon Container */}
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 border border-primary/20 text-primary shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary/5 group-hover:bg-primary/20">
                {step.icon}
              </div>

              {/* Step Title & Label */}
              <div className="relative z-10">
                <span className="block text-[10px] font-bold tracking-[0.3em] uppercase text-primary/60 mb-2 transition-colors group-hover:text-primary">
                  Step {step.id}
                </span>
                <h3 className="text-2xl font-black text-text-primary mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-base leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {step.description}
                </p>
              </div>

              {/* Subtle accent hover line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[2px]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
