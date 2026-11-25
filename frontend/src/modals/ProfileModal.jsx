import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Mail,
  Camera,
  ShieldCheck,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/authHook";
import { apiClient } from "../utils/apiClient";

export default function ProfileModal({ open, onClose }) {
  const { user, reFetch } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    pincode: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        city: user.address?.city || user.address?.district || "",
        pincode: user.address?.pincode || "",
      });
      setPreviewUrl(user.profileImage || null);
      setProfileImageFile(null);
    }
  }, [user, open]);

  if (!open) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Safe image upload to Cloudinary with fallback to smart avatar
  const uploadImageIfSelected = async (file) => {
    if (!file) return null;

    try {
      const img = new FormData();
      img.append("images", file);
      const res = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/items/upload-images`, {
        method: "POST",
        body: img,
      });
      const data = await res.json();
      if (res.ok && data?.data?.urls?.[0]) {
        return data.data.urls[0];
      }
    } catch (err) {
      console.warn("Backend image upload notice, falling back to avatar:", err);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = previewUrl;
      if (profileImageFile) {
        finalImageUrl = await uploadImageIfSelected(profileImageFile);
      }
      if (!finalImageUrl) {
        finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          formData.name.trim()
        )}&background=f97316&color=fff&bold=true`;
      }

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: {
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
        },
        profileImage: finalImageUrl,
      };

      const res = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/user/me/profile`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (reFetch) await reFetch();
      toast.success("Profile updated successfully! ✨");
      onClose();
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Could not save profile changes");
    } finally {
      setLoading(false);
    }
  };

  const userRole = user?.roles || user?.role || "renter";
  const avatarToDisplay =
    previewUrl ||
    user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=f97316&color=fff&bold=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]">
      <div className="bg-surface border border-divider rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-[modalIn_150ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-divider">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-text-primary">
              My Profile & Account
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                userRole === "owner"
                  ? "bg-secondary-accent/20 text-secondary-accent border border-secondary-accent/30"
                  : userRole === "admin"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-bright/15 text-bright border border-bright/30"
              }`}
            >
              {userRole}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Top Avatar & Basic Info Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-app border border-divider">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-card border border-divider flex items-center justify-center">
                <img
                  src={avatarToDisplay}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-primary truncate">
                  {user?.name || "Rentora Member"}
                </h3>
                {user?.isVerified && (
                  <CheckCircle2 size={14} className="text-success shrink-0" />
                )}
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
                <span className="flex items-center gap-1">
                  <Wallet size={12} className="text-primary" />
                  <span>Wallet: ₹{user?.walletBalance || 0}</span>
                </span>
                <span>•</span>
                <span className="text-success font-medium">Account Active</span>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted size-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-app border border-divider text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email (Read-Only) & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Email (Registered)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-3.5" />
                  <input
                    type="text"
                    disabled
                    value={user?.email || ""}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-divider text-xs text-text-muted cursor-not-allowed"
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
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-app border border-divider text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-3.5" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-app border border-divider text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. Bangalore"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-app border border-divider text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. 560001"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-divider text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-text-primary transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
