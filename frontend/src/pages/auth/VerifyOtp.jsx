import { useState, useRef } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const VerifyOtp = ({ email, switchMode }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleVerifyOtp(newOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (providedOtp) => {
    if (loading) return;
    
    const currentOtp = Array.isArray(providedOtp) ? providedOtp : otp;
    if (currentOtp.includes("")) return;

    setLoading(true);
    try {
      const otpString = currentOtp.join("");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
        credentials: "include"
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      switchMode("completeProfile");
    } catch (error) {
      console.error("Error in verify otp", error.message);
      let errorMessage = error.message;
      if (errorMessage.toLowerCase().includes("limit") || errorMessage.toLowerCase().includes("too many")) {
        errorMessage = "Too many attempts, please try again after 10 minutes";
      } else if (errorMessage === "Failed to fetch") {
        errorMessage = "Server is unreachable";
      }
      toast.error(errorMessage || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Verification code resent! 📩");
    } catch (error) {
      console.error("Error resending OTP", error.message);
      let errorMessage = error.message;
      if (errorMessage.toLowerCase().includes("limit") || errorMessage.toLowerCase().includes("too many")) {
        errorMessage = "Too many attempts, please try again after 10 minutes";
      } else if (errorMessage === "Failed to fetch") {
        errorMessage = "Server is unreachable";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Verify Your Account
          </h1>
          <p className="text-text-secondary text-sm mt-1 leading-relaxed">
            We've sent a 6-digit code to <span className="text-text-primary font-medium">{email}</span>
          </p>
        </div>

        {/* Fixed OTP Field */}
        <div className="mb-8">
          <fieldset className="flex justify-between gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full aspect-square text-center text-lg font-bold 
                           rounded-xl border border-divider
                           bg-app text-text-primary 
                           focus:border-primary focus:ring-1 focus:ring-primary/40 
                           transition-all outline-none"
              />
            ))}
          </fieldset>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            disabled={loading || otp.includes("")}
            className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50
                       text-text-primary font-semibold rounded-xl 
                       shadow-md 
                       flex items-center justify-center gap-2 
                       transition-all cursor-pointer active:scale-[0.98] text-sm"
            onClick={handleVerifyOtp}
          >
            {loading ? "Verifying..." : "Verify Identity"}
            {!loading && <ShieldCheck className="w-4 h-4" />}
          </button>

          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Didn’t receive the code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-primary font-medium hover:underline disabled:opacity-50 cursor-pointer"
              >
                Resend
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtp;