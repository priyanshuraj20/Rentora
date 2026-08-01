import AuthLayout from "../../components/auth/AuthLayout";
import { LockKeyhole } from "lucide-react";
import { Mail, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useState } from "react";
import ForgotPasswordModal from "../../modals/ForgotPasswordModal";

const Login = ({ switchMode, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();

    if (!user.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!user.password.trim()) {
      toast.error("Password is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(user),
      })
      const data = await res.json();
      if (!data.success) {
        throw new Error("Invalid credentials");
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
      <div className="p-8 pb-6 text-center">

        <h1 className="text-text-primary text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-text-secondary/50 text-sm mt-1">
          Login to continue renting or listing items
        </p>
      </div>

      {/* Form */}
      <div className="px-8 pb-8">
        <form className="space-y-5" onSubmit={handleLogin}>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email address
            </label>
            <div className="relative">

              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/30 text-lg" />
              <input
                type="email"
                placeholder="name@example.com"
                value={user.email}
                onChange={(e) => {
                  setUser({ ...user, email: e.target.value });
                }}
                className="form-input w-full pl-12 pr-4 py-3 bg-app border border-text-secondary/30 rounded-2xl text-text-primary placeholder:text-text-secondary/30 focus:outline-none transition
              focus:border-bright"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-primary">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-bright text-xs font-semibold hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            </div>


            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/30 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={user.password}
                onChange={(e) => {
                  setUser({ ...user, password: e.target.value });
                }}
                className="form-input w-full pl-12 pr-4 py-3 bg-app border rounded-2xl text-text-primary placeholder:text-text-secondary/30 focus:outline-none transition focus:border-bright border-text-secondary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/30 text-lg"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-bright hover:bg-bright/80 text-card font-extrabold py-3.5 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white hover:cursor-pointer"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              <>
                Login
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-color" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-4 text-text-secondary/50 tracking-widest">
              or continue with
            </span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex items-center justify-center gap-3 w-full 
                     bg-app hover:bg-app/80 text-text-primary font-medium 
                     py-3 px-4 rounded-2xl transition-all cursor-pointer
                     border border-text-secondary/10"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-sm">Continue with Google</span>
        </button>
      </div>

      {/* Footer */}
      <div className="bg-background-dark/60 px-8 py-5 border-t border-divider text-center">
        <p className="text-text-secondary text-sm">
          Don’t have an account?
          <button className="text-bright font-semibold hover:underline ml-1" onClick={() => switchMode("register")}>
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
