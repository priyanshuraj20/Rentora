import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, XCircle } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-20 overflow-hidden border-t border-divider bg-app">
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="max-w-4xl mx-auto rounded-2xl p-10 md:p-14 text-center relative overflow-hidden bg-surface border border-divider shadow-xl">

          {/* Main Content */}
          <div className="relative z-10 py-2">
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-text-primary mb-5 leading-[1.1] tracking-tight">
              Ready to Turn <br />
              <span className="italic bg-gradient-to-r from-primary via-secondary-accent to-primary bg-clip-text text-transparent">
                Clutter Into Cash?
              </span>
            </h2>

            <p className="text-base md:text-lg text-text-secondary mb-8 max-w-xl mx-auto font-normal leading-relaxed">
              Join thousands of neighbors already renting smarter. Start listing today
              and see what your unused items could earn you.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/explore"
                className="group flex-1 bg-primary text-text-primary px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-hover active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Explore Items
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/explore"
                className="flex-1 bg-card px-8 py-3.5 rounded-xl font-semibold text-base border border-divider hover:bg-white/5 transition-all text-text-primary active:scale-95"
              >
                List for Free
              </Link>
            </div>

            {/* Benefit Indicators */}
            <div className="mt-10 pt-6 border-t border-divider flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <ShieldCheck size={16} className="text-primary" />
                SSL Secured
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Zap size={16} className="text-primary" />
                No listing fees
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <XCircle size={16} className="text-primary" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
