import { useState } from "react";
import { X, Mail, KeyRound, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, { credentials: "include" });
      const csrfData = await csrf.json();

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken,
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("OTP sent to your email!");
        setStep(2);
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error("Please enter OTP and new password");
      return;
    }

    setLoading(true);
    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, { credentials: "include" });
      const csrfData = await csrf.json();

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken,
        },
        body: JSON.stringify({ email, otp, newPassword }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Password reset successfully! You can now login.");
        onClose();
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-divider rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-[modalIn_150ms_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-text-primary mb-1">Reset Password</h2>
        <p className="text-xs text-text-secondary mb-6">
          {step === 1 ? "Enter your email to receive a password reset OTP" : "Enter the OTP sent to your email and your new password"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-app border border-divider rounded-xl pl-10 pr-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-text-primary py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer shadow-md text-xs"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">6-Digit OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-app border border-divider rounded-xl pl-10 pr-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary tracking-widest font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-app border border-divider rounded-xl pl-10 pr-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-text-primary py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer shadow-md text-xs"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
