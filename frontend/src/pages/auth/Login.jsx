import { useState, useEffect } from "react";
import { Mail, Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/authHook";
import ForgotPasswordModal from "../../modals/ForgotPasswordModal";

const Login = ({ switchMode, onClose, role = "owner", setRole }) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coldStartNotice, setColdStartNotice] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setColdStartNotice(true);
      }, 3000);
    } else {
      setColdStartNotice(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [showForgotModal, setShowForgotModal] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!user.email || !user.password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await login(user.email, user.password);

      if (!result.success) {
        throw new Error(result.message || "Invalid Email or Password");
      }

      toast.success("Welcome back! 🚀");
      navigate("/role-redirect");
      onClose?.();

    } catch (error) {
      console.error(error.message);
      toast.error(error.message === "Failed to fetch" ? "Server is unreachable" : error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>

      {/* Header */}
      <div className="p-6 pb-4 text-center border-b border-divider">
        {setRole && (
          <div className="flex justify-center mb-3">
            <div className="inline-flex p-1 rounded-xl bg-app border border-divider shadow-inner">
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === "owner"
                    ? "bg-primary text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                }`}
              >
                <span>Owner Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("renter")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === "renter"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                }`}
              >
                <span>Renter Portal</span>
              </button>
            </div>
          </div>
        )}

        <h1 className="text-text-primary text-xl font-bold tracking-tight">
          {role === "owner" ? "Welcome Back, Owner" : "Welcome Back, Renter"}
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          {role === "owner"
            ? "Sign in to manage gear listings, active rentals & earnings"
            : "Sign in to explore gear nearby, track bookings & voice orders"}
        </p>
      </div>

      {/* Form */}
      <div className="p-8">
        <form className="space-y-4" onSubmit={handleLogin}>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted size-4" />
              <input
                type="email"
                placeholder="name@example.com"
                value={user.email}
                onChange={(e) => {
                  setUser({ ...user, email: e.target.value });
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-divider rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className={`${role === "renter" ? "text-emerald-400" : "text-primary"} text-xs font-medium hover:underline cursor-pointer`}
              >
                Forgot?
              </button>
            </div>

            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted size-4" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={user.password}
                onChange={(e) => {
                  setUser({ ...user, password: e.target.value });
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-card border border-divider rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-sm cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full mt-4 font-semibold py-2.5 rounded-lg transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer ${
              role === "renter"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-primary hover:bg-primary-hover text-text-primary shadow-primary/20"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              <>
                <span>Sign In to {role === "owner" ? "Owner Portal" : "Renter Portal"}</span>
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </>
            )}
          </button>

          {/* Cloud cold-start helper hint */}
          {coldStartNotice && (
            <div className="mt-2.5 p-2 bg-primary/10 border border-primary/20 rounded-lg text-center animate-fade-in">
              <p className="text-[11px] text-primary font-medium leading-tight">
                ⚡ Free-tier server is waking up from idle state... Thanks for your patience!
              </p>
            </div>
          )}

        </form>
      </div>

      {/* Footer */}
      <div className="bg-card/60 px-8 py-3.5 border-t border-divider text-center">
        <p className="text-text-secondary text-xs">
          Don’t have an account?
          <button className={`${role === "renter" ? "text-emerald-400" : "text-primary"} font-semibold hover:underline ml-1 cursor-pointer`} onClick={() => switchMode("register")}>
            Register
          </button>
        </p>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </AuthLayout>
  );
};

export default Login;
