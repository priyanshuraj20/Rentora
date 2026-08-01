import { ShieldCheck, Lock, Verified } from "lucide-react";

const features = [
  {
    icon: <Verified className="size-6" />,
    title: "Verified Members",
    description:
      "Every member undergoes a rigorous ID verification process. We background-check all listers so you can rent with complete confidence.",
  },
  {
    icon: <Lock className="size-6" />,
    title: "Secure Payments",
    description:
      "Your money is held in escrow until the rental completes to your satisfaction. End-to-end encrypted and PCI-compliant checkout.",
  },
  {
    icon: <ShieldCheck className="size-6" />,
    title: "Damage Protection",
    description:
      "List with peace of mind. Our comprehensive protection plan covers unexpected damage up to ₹50,000 for every active listing.",
  },
];

export default function Trust() {
  return (
    <section className="py-20 border-t border-divider bg-app relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-text-primary leading-[1.1] mb-4 tracking-tight">
            Built on Trust, <br />Designed for People
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-normal">
            Every layer of the experience is engineered to make renting feel safe,
            seamless, and genuinely human.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl p-8 bg-surface border border-divider transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-xl cursor-default overflow-hidden"
            >
              {/* Icon Container */}
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-secondary-accent/15 border border-secondary-accent/30 text-secondary-accent transition-all duration-300 group-hover:scale-105">
                {feature.icon}
              </div>

              {/* Feature Title & Text */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
