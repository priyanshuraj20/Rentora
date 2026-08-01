import { useState, useEffect, useRef } from "react";
import { X, Phone, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../config/firebase";
import toast from "react-hot-toast";

export default function PhoneVerificationModal({ initialPhone = "", onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("PHONE"); // 'PHONE' | 'OTP'
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const mapFirebaseError = (error) => {
    const code = error?.code;
    switch (code) {
      case "auth/invalid-verification-code":
        return "Incorrect OTP code. Please check your SMS and try again.";
      case "auth/code-expired":
        return "SMS OTP has expired. Please click Resend OTP.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a few minutes before trying again.";
      case "auth/invalid-phone-number":
        return "Invalid phone number. Please enter a valid 10-digit mobile number.";
      case "auth/quota-exceeded":
        return "SMS limit reached. Please contact support.";
      default:
        return error?.message || "Phone verification failed. Please try again.";
    }
  };

  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          toast.error("reCAPTCHA expired. Please try sending OTP again.");
        },
      });
    }
    return recaptchaVerifierRef.current;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber.replace(/\D/g, "")}`;

      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);

      setConfirmationResult(result);
      setStep("OTP");
      setCooldown(60);
      toast.success(`SMS OTP sent to ${formattedPhone}`);
    } catch (error) {
      console.error("Firebase SMS OTP error:", error);
      toast.error(mapFirebaseError(error));
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber.replace(/\D/g, "")}`;

      // Call Backend to verify token and update status
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/me/verification/phone-firebase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken,
          },
          body: JSON.stringify({
            idToken,
            phoneNumber: formattedPhone,
          }),
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success("Phone number verified successfully!");
        onSuccess?.();
      } else {
        throw new Error(data.message || "Backend verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(mapFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div id="recaptcha-container"></div>
      <div className="bg-surface border border-divider rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Phone className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary tracking-tight">
              Phone Number Verification
            </h3>
            <p className="text-xs text-text-secondary">
              Real SMS OTP verification powered by Firebase
            </p>
          </div>
        </div>

        {step === "PHONE" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Mobile Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-card border border-divider px-3 py-2.5 rounded-xl text-sm font-bold text-text-primary">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={phoneNumber.replace(/^\+91/, "")}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 bg-card border border-divider rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="bg-app p-3 rounded-xl border border-divider flex items-start gap-2 text-xs text-text-secondary">
              <ShieldCheck className="size-4 text-success shrink-0 mt-0.5" />
              <span>
                A 6-digit SMS verification OTP will be delivered directly to your phone number.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-card border border-divider text-text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || phoneNumber.length < 10}
                className="flex-1 bg-primary text-text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Sending SMS..." : "Send SMS OTP"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Enter 6-Digit SMS OTP
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-widest text-lg font-bold bg-card border border-divider rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Didn't receive code?</span>
              {cooldown > 0 ? (
                <span className="font-mono text-primary">{cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="size-3" /> Resend OTP
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("PHONE")}
                className="flex-1 bg-card border border-divider text-text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors cursor-pointer"
              >
                Change Number
              </button>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex-1 bg-primary text-text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Verify & Complete
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
