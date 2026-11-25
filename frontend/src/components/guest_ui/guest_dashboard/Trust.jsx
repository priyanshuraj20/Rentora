import { ShieldCheck, Lock, KeyRound, Sparkles, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: <Lock className="size-6" />,
    title: "Secure Payments",
    description:
      "All transactions and refundable deposits are safely managed through platform escrow. Payouts are settled smoothly upon successful rental completion.",
  },
  {
    icon: <KeyRound className="size-6" />,
    title: "Verified PIN Handover",
    description:
      "Seamless 6-digit numeric verification codes at pickup and return ensure handovers happen with the right verified person, eliminating false claims.",
  },
  {
    icon: <Sparkles className="size-6" />,
    title: "AI-Powered Condition Inspection",
    description:
      "Multimodal Google Gemini AI compares pickup and return photo evidence to provide objective, impartial condition assessments and transparent reports.",
  },
  {
    icon: <CheckCircle2 className="size-6" />,
    title: "Transparent Deposit Settlement",
    description:
      "Security deposits are held safely in escrow and automatically refunded to the renter via Razorpay when gear is returned in good condition.",
  },
];

export default function Trust() {
  return (
    <section className="py-20 border-t border-divider bg-app relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary leading-[1.15] mb-4 tracking-tight">
            Built on Trust. <br className="hidden sm:inline" />
            Powered by Smart Technology.
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-normal">
            Every transaction matters. Rentora combines secure payments, verified handovers, AI-assisted condition inspections, and transparent processes to make peer-to-peer sharing more reliable.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl p-7 bg-surface border border-divider transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-xl cursor-default overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Icon Container */}
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-secondary-accent/15 border border-secondary-accent/30 text-secondary-accent transition-all duration-300 group-hover:scale-105">
                  {feature.icon}
                </div>

                {/* Feature Title & Text */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-text-primary mb-2.5 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
