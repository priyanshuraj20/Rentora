import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, XCircle } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-16 overflow-hidden border-t border-divider bg-[#0c0e11]">

      {/* Dynamic ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none z-0 animate-pulse" />

      <div className="relative max-w-7xl mx-auto px-6 z-10 transition-all duration-1000">
        <div className="max-w-5xl mx-auto rounded-[48px] p-10 md:p-14 text-center relative overflow-hidden bg-card border border-primary/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] group">

          {/* Inner mesh pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] group-hover:opacity-[0.05] transition-opacity duration-700" />

          {/* Main Content */}
          <div className="relative z-10 py-2">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-6 leading-[1.1] tracking-tight">
              Ready to Turn <br />
              <span className="bg-gradient-to-r from-primary via-[#42a8f8] to-primary bg-clip-text text-transparent animate-gradient">Clutter Into Cash?</span>
            </h2>

            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
              Join thousands of neighbors already renting smarter. Start listing today
              and see what your unused items could earn you.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 px-4">
              <Link
                to="/explore"
                className="group flex-1 bg-primary text-app px-10 py-5 rounded-full font-black text-lg hover:scale-[1.03] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                Explore Items
                <ArrowRight size={22} className="transition-transform group-hover:translate-x-1.5" />
              </Link>

              <Link
                to="/explore"
                className="flex-1 bg-surface px-10 py-5 rounded-full font-black text-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-text-primary active:scale-95 shadow-xl"
              >
                List for Free
              </Link>
            </div>

            {/* Benefit Indicators */}
            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-10 lg:gap-14 flex-wrap">
              <div className="flex items-center gap-3 text-sm font-bold text-text-muted transition-colors hover:text-primary group/item">
                <ShieldCheck size={20} className="text-primary/70 group-hover/item:text-primary transition-colors" />
                SSL Secured
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-text-muted transition-colors hover:text-primary group/item">
                <Zap size={20} className="text-primary/70 group-hover/item:text-primary transition-colors" />
                No listing fees
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-text-muted transition-colors hover:text-primary group/item">
                <XCircle size={20} className="text-primary/70 group-hover/item:text-primary transition-colors" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Background gradient shim for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
