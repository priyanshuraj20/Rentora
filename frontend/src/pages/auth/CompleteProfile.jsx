import { useState, useRef } from "react";
import {
  Camera,
  ShoppingBasket,
  TrendingUp,
  User,
  MapPin,
  Phone,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";


import useAuth from "../../hooks/authHook";
import { useEffect } from "react";


export default function CompleteProfile({ switchMode }) {

  const { user, loading: authLoading } = useAuth();
  const [intent, setIntent] = useState("renter");
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
      }));
      if (user.profileImage && !previewUrl) {
        setPreviewUrl(user.profileImage);
      }
    }
  }, [user]);

  // Convert ProfileImage to CloudinaryImage
  const convertImage = async (profilePic) => {
    if (!profilePic) return null;
    const url = import.meta.env.VITE_CLOUDINARY_URL;
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET;
    if (!url || !preset) {
      throw new Error("Cloudinary credentials are not configured. Please check VITE_CLOUDINARY_URL and VITE_CLOUDINARY_PRESET.");
    }
    const img = new FormData();
    img.append("file", profilePic);
    img.append("upload_preset", preset);
    const res = await fetch(
      url,
      {
        method: "POST",
        body: img
      }
    );
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      throw new Error(data?.error?.message || "Failed to upload profile photo to Cloudinary");
    }
    return data.secure_url;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImage && !previewUrl) {
      toast.error("Please upload a profile photo");
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!pincode.trim()) {
      toast.error("Please enter your pincode");
      return;
    }

    setLoading(true);
    try {

      // Step 1 : profileImage upload to Cloudinary (If new image selected)
      let uploadedImageUrl = previewUrl;
      if (profileImage) {
        uploadedImageUrl = await convertImage(profileImage);
        if (!uploadedImageUrl) {
          toast.error("Failed to upload image");
          return;
        }
      }

      // Step 2 : Complete profile backend call
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      const roleSelected = intent === "owner" ? "owner" : "renter";
      const payload = {
        name: formData.fullName,
        phone: formData.phone,
        address: { pincode: pincode },
        role: roleSelected,
        profileImage: uploadedImageUrl,
      };

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/me/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully 🎉");
      // Page reload to refresh Auth Context & Cookie state, triggering automatic role-redirect
      window.location.href = roleSelected === "owner" ? "/owner" : "/renter";
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-app py-8">

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      <div className="mx-auto max-w-xl px-4">
        {/* Main Card */}
        <div className="rounded-3xl bg-surface border border-divider p-8 shadow-2xl space-y-6">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Complete Profile</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Set up your avatar, details and account preferences
            </p>
          </div>

          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative cursor-pointer group" onClick={triggerFileInput}>
              <div className="h-24 w-24 rounded-full border-2 border-primary/40 bg-card overflow-hidden flex items-center justify-center shadow-md">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-text-muted" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-text-primary shadow-md">
                <Camera className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Intent Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
              I WANT TO
            </label>
            <div className="grid grid-cols-2 gap-3">
              <IntentCard
                active={intent === "renter"}
                title="Rent Items"
                subtitle="Browse & borrow"
                icon={<ShoppingBasket className="w-4 h-4" />}
                onClick={() => setIntent("renter")}
              />
              <IntentCard
                active={intent === "owner"}
                title="List Items"
                subtitle="Earn from gear"
                icon={<TrendingUp className="w-4 h-4" />}
                onClick={() => setIntent("owner")}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-2">
            <Input
              label="FULL NAME"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              icon={<User className="w-4 h-4" />}
            />

            <Input
              label="LOCATION"
              name="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
              icon={<MapPin className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                PHONE NUMBER
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className="w-full rounded-xl bg-app border border-divider px-11 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-normal"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary hover:bg-primary-hover py-3.5 font-semibold text-text-primary shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-8 text-sm cursor-pointer"
          >
            <span>{loading ? "Processing..." : "Complete Setup"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    </form>
  );
}

/* ----------------- Components ----------------- */

function IntentCard({ active, title, subtitle, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-3.5 text-left transition-all cursor-pointer ${active
        ? "border-2 border-primary bg-primary/10"
        : "bg-app border border-divider hover:bg-white/5"
        } flex items-center gap-3`}
    >
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${active ? "bg-primary text-text-primary" : "bg-card text-text-muted"
        }`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm text-text-primary">{title}</p>
        <p className="text-xs text-text-muted font-normal">{subtitle}</p>
      </div>
    </button>
  );
}

function Input({ label, placeholder, icon, name, value, onChange, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
          className="w-full rounded-xl bg-app border border-divider px-11 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
  );
}