import logo from "../../assets/logo.svg";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-divider pt-16 pb-10">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* TOP GRID */}
        <div className="grid md:grid-cols-4 gap-10 mb-16">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <img src={logo} alt="logo" width="34px" height="34px" className="rounded-xl shadow-sm" />
              <h2 className="text-xl font-bold text-text-primary">
                Rentora
              </h2>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              The premium local rental marketplace designed for trust,
              convenience, and community sustainability.
            </p>

            <div className="flex gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-xl border border-divider flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition"
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </a>

              <a
                href="#"
                className="w-8 h-8 rounded-xl border border-divider flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition"
              >
                <span className="material-symbols-outlined text-sm">
                  alternate_email
                </span>
              </a>
            </div>
          </div>

          {/* MARKETPLACE */}
          <div>
            <h4 className="font-semibold mb-5 text-text-primary text-sm uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a className="hover:text-primary transition-colors" href="#">Browse Items</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">How it Works</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Verification</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Rentora Pro</a></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-semibold mb-5 text-text-primary text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Impact Report</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Press</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="font-semibold mb-5 text-text-primary text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Safety Rules</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-6 border-t border-divider flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs">
            © 2026 Rentora Marketplace. All rights reserved.
          </p>

          <div className="flex gap-6 text-xs text-text-muted">
            <a className="hover:text-primary transition-colors" href="#">English (US)</a>
            <a className="hover:text-primary transition-colors" href="#">INR (₹)</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
