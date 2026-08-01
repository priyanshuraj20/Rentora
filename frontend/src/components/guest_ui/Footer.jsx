import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-deep-dark border-t border-divider pt-20 pb-10">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* TOP GRID */}
        <div className="grid md:grid-cols-4 gap-12 mb-20">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="logo" width="35px" />
              <h2 className="text-lg font-bold text-white">
                Rent It Right
              </h2>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              The premium local rental marketplace designed for trust,
              convenience, and community sustainability.
            </p>

            <div className="flex gap-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:text-white hover:bg-accent/10 transition"
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </a>

              <a
                href="#"
                className="w-8 h-8 rounded-full border border-border-custom flex items-center justify-center text-text-secondary hover:text-white hover:bg-accent/10 transition"
              >
                <span className="material-symbols-outlined text-sm">
                  alternate_email
                </span>
              </a>
            </div>
          </div>

          {/* MARKETPLACE */}
          <div>
            <h4 className="font-bold mb-6 text-white">Marketplace</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><a className="hover:text-accent" href="#">Browse Items</a></li>
              <li><a className="hover:text-accent" href="#">How it Works</a></li>
              <li><a className="hover:text-accent" href="#">Verification</a></li>
              <li><a className="hover:text-accent" href="#">Rent It Pro</a></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-bold mb-6 text-white">Company</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><a className="hover:text-accent" href="#">About Us</a></li>
              <li><a className="hover:text-accent" href="#">Impact Report</a></li>
              <li><a className="hover:text-accent" href="#">Careers</a></li>
              <li><a className="hover:text-accent" href="#">Press</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="font-bold mb-6 text-white">Support</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><a className="hover:text-accent" href="#">Help Center</a></li>
              <li><a className="hover:text-accent" href="#">Safety Rules</a></li>
              <li><a className="hover:text-accent" href="#">Terms of Service</a></li>
              <li><a className="hover:text-accent" href="#">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-border-custom flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-secondary text-xs">
            © 2024 Rent It Right Marketplace. All rights reserved.
          </p>

          <div className="flex gap-8 text-xs text-text-secondary">
            <a className="hover:text-accent" href="#">English (US)</a>
            <a className="hover:text-accent" href="#">INR (₹)</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
