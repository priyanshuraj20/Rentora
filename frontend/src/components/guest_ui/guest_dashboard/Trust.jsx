import { Mic, Sparkles, Wand2, KeyRound } from "lucide-react";

const features = [
  {
    icon: <Mic className="size-6 text-primary" />,
    badge: "Sarvam AI • 11 Languages",
    title: "Autonomous Voice AI Booking",
    description:
      "Speak naturally in Hinglish, Hindi, or English. Sarvam Saaras STT & Bulbul TTS understand rental intent, verify calendar availability, and build booking cards completely hands-free.",
    tag: "Conversational Voice AI",
    badgeColor: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    icon: <Sparkles className="size-6 text-secondary-accent" />,
    badge: "Google Gemini 1.5",
    title: "Multimodal Damage Inspection",
    description:
      "Multimodal vision AI compares high-resolution pickup vs return photos to objectively detect scratches, dents, and wear — generating impartial, evidence-backed inspection reports.",
    tag: "Computer Vision Delta",
    badgeColor: "border-secondary-accent/30 bg-secondary-accent/10 text-secondary-accent",
  },
  {
    icon: <Wand2 className="size-6 text-primary" />,
    badge: "Gemini Vision & LLM",
    title: "Instant Snap-to-List AI",
    description:
      "Owners snap a single photo; our AI model recognizes the exact equipment brand and model, generates optimized SEO titles, auto-fills specifications, and suggests optimal rental pricing.",
    tag: "Auto Specs & Price AI",
    badgeColor: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    icon: <KeyRound className="size-6 text-secondary-accent" />,
    badge: "Zero-Fraud Handover",
    title: "Cryptographic PIN & Acoustic Consent",
    description:
      "Time-sensitive 6-digit numeric tokens combined with acoustic voice confirmation ensure gear is only released to the verified renter in person — eliminating false non-delivery disputes.",
    tag: "Acoustic + Tokenized Handover",
    badgeColor: "border-secondary-accent/30 bg-secondary-accent/10 text-secondary-accent",
  },
];

export default function Trust() {
  return (
    <section className="py-20 border-t border-divider bg-app relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary leading-[1.15] mb-4 tracking-tight">
            Built on Trust. <br className="hidden sm:inline" />
            Powered by Smart Technology.
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-normal">
            From autonomous Indic voice booking and Gemini multimodal damage inspections to instant photo cataloging and cryptographic handovers — Rentora replaces friction and guesswork with intelligent, verified technology.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl p-6 bg-surface border border-divider transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl cursor-default overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon & Tech Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/20">
                    {feature.icon}
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${feature.badgeColor}`}>
                    {feature.badge}
                  </span>
                </div>

                {/* Feature Title & Text */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-text-primary mb-2.5 tracking-tight leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Bottom Tech Tag */}
              <div className="pt-4 mt-4 border-t border-white/5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                  {feature.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
