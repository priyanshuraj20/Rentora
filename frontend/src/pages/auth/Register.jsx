import AuthLayout from "../../components/auth/AuthLayout";
import { useState } from "react";
import toast from "react-hot-toast";

import { Mail, Eye, EyeOff, LockKeyhole } from "lucide-react";

const Register = ({ switchMode, email, setEmail }) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
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

    if (user.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!checked) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(user),
        },
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      const sendOtp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email: user.email }),
        },
      );
      const otpData = await sendOtp.json();
      if (!otpData.success) {
        throw new Error(otpData.message || "Failed to send OTP");
      }

      toast.success("Verification code sent! 📩");
      setEmail(user.email);
      switchMode("otp");
    } catch (error) {
      console.error("Error in register", error.message);
      let errorMessage = error.message;
      if (
        errorMessage.toLowerCase().includes("limit") ||
        errorMessage.toLowerCase().includes("too many")
      ) {
        errorMessage = "Too many attempts, please try again after 10 minutes";
      } else if (errorMessage === "Failed to fetch") {
        errorMessage = "Server is unreachable";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google?flow=register`;
  };

  return (
    <AuthLayout>
      {/* Header */}
      <div className="p-8 pb-6 text-center border-b border-divider">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Create Your Account
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          Join your local rental community
        </p>
      </div>

      {/* Form */}
      <div className="p-8">
        <form className="space-y-4" onSubmit={handleRegister}>
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
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Password
            </label>
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

          {/* Terms */}
          <div className="flex items-start gap-2.5 py-1">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className="mt-0.5 rounded border-divider bg-card text-primary focus:ring-primary accent-[#e8734a]"
            />
            <p className="text-xs text-text-secondary leading-relaxed">
              By creating an account, I agree to Rentora&apos;s{" "}
              <span className="text-primary hover:underline cursor-pointer font-medium">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-primary hover:underline cursor-pointer font-medium">
                Privacy Policy
              </span>
              .
            </p>
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-primary hover:bg-primary-hover text-text-primary font-semibold 
                       py-2.5 px-6 rounded-lg text-sm shadow-sm transition-all 
                       active:scale-[0.98] mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
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
          Already have an account?
          <button className="text-primary font-semibold hover:underline ml-1 cursor-pointer" onClick={() => switchMode("login")}>
            Login
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
