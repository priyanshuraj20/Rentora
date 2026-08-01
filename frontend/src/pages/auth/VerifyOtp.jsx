import { useState, useRef } from "react"; // Added useRef for auto-focus
import AuthLayout from "../../components/auth/AuthLayout";
import { ShieldCheck, Clock } from "lucide-react";
import toast from "react-hot-toast";

const VerifyOtp = ({ email, switchMode }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]); // To control focus

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all digits are entered
    if (newOtp.every((digit) => digit !== "")) {
      handleVerifyOtp(newOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back on Backspace if empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (providedOtp) => {
    if (loading) return;
    
    // If called automatically, use the providedOtp array; otherwise use state
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
      <div className="p-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Verify Your Account
          </h1>
          <p className="text-text-secondary/60 text-sm mt-2 leading-relaxed">
            We've sent a 6-digit code to <span className="text-text-primary font-medium">{email}</span>
          </p>
        </div>

        {/* Fixed OTP Field */}
        <div className="mb-14">
          <fieldset className="flex justify-between gap-2 sm:gap-4">
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
                className="w-full aspect-square text-center text-xl font-bold 
                           rounded-lg border border-text-secondary/40
                           bg-transparent text-text-primary 
                           focus:border-bright focus:ring-1 focus:ring-bright 
                           transition-all duration-200 outline-none"
              />
            ))}
          </fieldset>
        </div>

        <div className="space-y-6">
          <button
            type="button"
            disabled={loading || otp.includes("")}
            className="w-full h-14 bg-bright hover:bg-bright/90 disabled:opacity-50
                       text-card font-extrabold rounded-2xl 
                       shadow-lg shadow-primary/20 
                       flex items-center justify-center gap-2 
                       transition-transform active:scale-[0.98]"
            onClick={handleVerifyOtp}
          >
            {loading ? "Verifying..." : "Verify Identity"}
            {!loading && <ShieldCheck className="w-5 h-5" />}
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Didn’t receive the code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-bright font-medium hover:underline disabled:opacity-50"
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