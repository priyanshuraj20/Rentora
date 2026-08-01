import { useState } from "react";
import { Mail, Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/authHook";
import ForgotPasswordModal from "../../modals/ForgotPasswordModal";

const Login = ({ switchMode, onClose }) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      onClose();

    } catch (error) {
      console.error(error.message);
      toast.error(error.message === "Failed to fetch" ? "Server is unreachable" : error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google?flow=login`;
  };

  return (
    <AuthLayout>

      {/* Header */}
      <div className="p-8 pb-6 text-center border-b border-divider">
        <h1 className="text-text-primary text-xl font-bold tracking-tight">
          Welcome Back
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          Login to continue renting or listing items
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
                className="text-primary text-xs font-medium hover:underline cursor-pointer"
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
            className="w-full mt-4 bg-primary hover:bg-primary-hover text-text-primary font-semibold py-2.5 rounded-lg transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              <>
                Login
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-divider" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-surface px-3 text-text-muted font-bold tracking-widest">
              or continue with
            </span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex items-center justify-center gap-3 w-full 
                     bg-card hover:bg-white/5 text-text-primary font-medium 
                     py-2.5 px-4 rounded-lg transition-all cursor-pointer
                     border border-divider text-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Footer */}
      <div className="bg-card/60 px-8 py-3.5 border-t border-divider text-center">
        <p className="text-text-secondary text-xs">
          Don’t have an account?
          <button className="text-primary font-semibold hover:underline ml-1 cursor-pointer" onClick={() => switchMode("register")}>
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
