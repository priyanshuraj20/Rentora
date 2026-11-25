import { Search, PlusCircle, Handshake } from "lucide-react";

const steps = [
  {
    id: "01",
    icon: <Search className="size-5" />,
    title: "Discover What You Need",
    description:
      "Explore useful products, equipment, vehicles, and everyday essentials available from people in your neighborhood.",
  },
  {
    id: "02",
    icon: <PlusCircle className="size-5" />,
    title: "Share & Earn",
    description:
      "List your unused belongings, set your pricing and availability, and start receiving booking requests from interested users.",
  },
  {
    id: "03",
    icon: <Handshake className="size-5" />,
    title: "Connect & Grow",
    description:
      "Complete secure transactions, verify handovers and returns, and build trust through genuine community experiences.",
  },
];

export default function Steps() {
  return (
    <section id="how-it-works" className="py-20 scroll-mt-24 border-t border-divider bg-app">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary leading-[1.15] mb-4 tracking-tight">
            Turn What You Own Into Opportunity.
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-normal">
            Whether you want to earn from unused possessions or access something you need, getting started is simple.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative rounded-2xl p-8 bg-surface border border-divider transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-xl cursor-default overflow-hidden"
            >
              {/* Giant Watermark Number */}
              <div className="absolute -top-4 -right-2 text-[120px] font-bold select-none pointer-events-none leading-none opacity-[0.03] text-primary transition-all duration-500 group-hover:opacity-[0.06]">
                {step.id}
              </div>

              {/* Icon Container */}
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20">
                {step.icon}
              </div>

              {/* Step Title & Label */}
              <div className="relative z-10">
                <span className="block text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">
                  Step {step.id}
                </span>
                <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
