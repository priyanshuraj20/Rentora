import AuthLayout from "../../components/auth/AuthLayout";
import { useState } from "react";
import toast from "react-hot-toast";

import { Mail, Eye, EyeOff, LockKeyhole, User2 } from "lucide-react";

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
      <div className="px-8 pb-3 pt-6 md:px-10 ">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Create Your Account
          </h1>
          <p className="text-text-secondary/40 text-sm">
            Join your local rental community
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleRegister}>
          {/* Email / Phone */}
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
                className="form-input w-full pl-12 pr-4 py-3 bg-app border-1  border-text-secondary/30 rounded-2xl text-text-primary placeholder:text-text-secondary/30 focus:outline-none transition
                focus:border-bright"
              />
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-text-primary">
                  Password
                </label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/30 text-lg "
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 py-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className="mt-1 rounded border-border-muted bg-background-dark 
                         text-accent focus:ring-accent"
            />
            <p className="text-xs text-text-secondary leading-relaxed">
              By creating an account, I agree to Rentora&apos;s{" "}
              <span className="text-bright hover:underline cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-bright hover:underline cursor-pointer">
                Privacy Policy
              </span>
              .
            </p>
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-bright hover:bg-bright/90 text-card font-extrabold 
                       py-3 px-6 rounded-2xl text-base shadow-lg transition-all 
                       active:scale-[0.98] mt-2 border border-accent/20"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-4 text-text-secondary font-medium tracking-widest">
              OR CONTINUE WITH
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
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm">Continue with Google</span>
        </button>

        {/* Footer */}
        <div className="mt-8 px-8 py-5 border-t border-divider text-center">
          <p className="text-text-secondary text-sm">
            Already have an account?
            <button
              className="text-bright font-semibold hover:text-bright/80 transition-colors ml-1"
              onClick={() => switchMode("login")}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
