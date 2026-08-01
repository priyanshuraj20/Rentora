import { ShieldCheck, Lock, Verified } from "lucide-react";

const features = [
  {
    icon: <Verified className="size-7" />,
    title: "Verified Members",
    description:
      "Every member undergoes a rigorous ID verification process. We background-check all listers so you can rent with complete confidence.",
  },
  {
    icon: <Lock className="size-7" />,
    title: "Secure Payments",
    description:
      "Your money is held in escrow until the rental completes to your satisfaction. End-to-end encrypted and PCI-compliant checkout.",
  },
  {
    icon: <ShieldCheck className="size-7" />,
    title: "Damage Protection",
    description:
      "List with peace of mind. Our comprehensive protection plan covers unexpected damage up to ₹50,000 for every active listing.",
  },
];

export default function Trust() {
  return (
    <section
      className="py-20 border-t border-divider bg-app relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10 transition-all duration-700">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-black text-text-primary leading-[1.1] mb-5 tracking-tight">
            Built on Trust, <br />Designed for People
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-medium">
            Every layer of the experience is engineered to make renting feel safe,
            seamless, and genuinely human.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-[32px] p-8 md:p-10 bg-card border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] cursor-default overflow-hidden"
            >
              {/* Icon Container */}
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 border border-primary/20 text-primary shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary/5 group-hover:bg-primary/20">
                {feature.icon}
              </div>

              {/* Feature Title & Text */}
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-text-primary mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-base leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {feature.description}
                </p>
              </div>

              {/* Accent hover line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[2px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Subtle radial glow background behind sections */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
    </section>
  );
}
