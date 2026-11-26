import AuthLayout from "../../components/auth/AuthLayout";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  Phone,
  MapPin,
  Camera,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

const Register = ({
  switchMode,
  setEmail,
  initialRole = "owner",
  role: externalRole,
  setRole: setExternalRole,
}) => {
  const [internalRole, setInternalRole] = useState(initialRole);
  const role = externalRole || internalRole;
  const setRole = setExternalRole || setInternalRole;

  useEffect(() => {
    if (initialRole && !externalRole) {
      setInternalRole(initialRole);
    }
  }, [initialRole, externalRole]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    pincode: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Safe Cloudinary upload with graceful fallback so preset errors never block registration
  const uploadImageIfSelected = async (file) => {
    if (!file) return null;
    const url = import.meta.env.VITE_CLOUDINARY_URL;
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET;
    if (!url || !preset) return null;

    try {
      const img = new FormData();
      img.append("file", file);
      img.append("upload_preset", preset);
      const res = await fetch(url, { method: "POST", body: img });
      const data = await res.json();
      if (res.ok && data?.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.warn("Cloudinary upload notice (using fallback avatar):", err);
    }
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return;
    }

    if (!formData.pincode.trim()) {
      toast.error("Please enter your pincode");
      return;
    }

    if (!checked) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload photo if selected (optional; falls back safely)
      let photoUrl = null;
      if (profileImageFile) {
        photoUrl = await uploadImageIfSelected(profileImageFile);
      }
      if (!photoUrl) {
        photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          formData.fullName.trim()
        )}&background=f97316&color=fff&bold=true`;
      }

      // 2. Submit complete profile details directly at registration
      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role,
        roles: role,
        profileImage: photoUrl,
        address: {
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      // 3. Send verification OTP
      const sendOtp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: formData.email.trim() }),
        }
      );
      const otpData = await sendOtp.json();
      if (!otpData.success) {
        throw new Error(otpData.message || "Failed to send OTP");
      }

      toast.success("Verification code sent to your email! 📩");
      if (setEmail) setEmail(formData.email.trim());
      switchMode("otp");
    } catch (error) {
      console.error("Error in register:", error.message);
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

  return (
    <AuthLayout>
      {/* Header with Pre-selected Role Toggle */}
      <div className="p-6 pb-4 text-center border-b border-divider">
        {/* Seamless Role Toggle at Top */}
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
              <span>List & Earn</span>
              <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded text-white uppercase font-extrabold">
                Owner
              </span>
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
              <span>Browse & Rent</span>
              <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded text-white uppercase font-extrabold">
                Renter
              </span>
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          {role === "owner" ? "Create Owner Account" : "Create Renter Account"}
        </h1>
        <p className="text-text-secondary text-xs mt-1">
          {role === "owner"
            ? "List unused cameras, tools, or gear & earn 90% net bank payouts"
            : "Rent verified equipment nearby with 100% escrow protection"}
        </p>
      </div>

      {/* Form */}
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <form className="space-y-4" onSubmit={handleRegister}>
          {/* 1. Optional Profile Photo Picker */}
          <div className="flex items-center gap-3.5 p-2.5 rounded-xl bg-surface/50 border border-divider">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-14 h-14 rounded-full overflow-hidden bg-card border border-divider flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-text-muted" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-text-primary">
                Profile Photo{" "}
                <span className="text-[10px] text-text-muted font-normal">
                  (Optional)
                </span>
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                {profileImageFile
                  ? `Selected: ${profileImageFile.name.slice(0, 20)}...`
                  : "Click photo to upload, or a smart avatar will be created automatically."}
              </div>
            </div>
          </div>

          {/* 3. Full Name */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted size-4" />
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Priyanshu Raj"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 bg-card border border-divider rounded-lg text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* 4. Email & Phone (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-card border border-divider rounded-lg text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-3.5" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-card border border-divider rounded-lg text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 5. Password */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted size-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 bg-card border border-divider rounded-lg text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* 6. City & Pincode (2 columns) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-3.5" />
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Bangalore"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-card border border-divider rounded-lg text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                required
                placeholder="e.g. 560001"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-card border border-divider rounded-lg text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* 7. Terms Agreement */}
          <div className="flex items-start gap-2.5 py-1">
            <input
              type="checkbox"
              id="termsCheckbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className={`mt-0.5 rounded border-divider bg-card cursor-pointer ${
                role === "renter"
                  ? "text-emerald-500 focus:ring-emerald-500 accent-[#10b981]"
                  : "text-primary focus:ring-primary accent-[#e8734a]"
              }`}
            />
            <label htmlFor="termsCheckbox" className="text-xs text-text-secondary leading-relaxed cursor-pointer select-none">
              I agree to Rentora&apos;s{" "}
              <span className={`font-medium hover:underline ${role === "renter" ? "text-emerald-400" : "text-primary"}`}>
                Rental Terms
              </span>{" "}
              and Escrow Policy.
            </label>
          </div>

          {/* 8. CTA */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full cursor-pointer font-semibold py-2.5 px-6 rounded-lg text-xs shadow-sm transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 ${
              role === "renter"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-primary hover:bg-primary-hover text-text-primary shadow-primary/20"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              `Register as ${role === "owner" ? "Equipment Owner" : "Gear Renter"} →`
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
      <div className="bg-card/60 px-6 py-3 border-t border-divider text-center">
        <p className="text-text-secondary text-xs">
          Already have an account?
          <button
            className="text-primary font-semibold hover:underline ml-1 cursor-pointer"
            onClick={() => switchMode("login")}
          >
            Login
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
