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
    const img = new FormData();
    img.append("file", profilePic);
    img.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
    const res = await fetch(
      url,
      {
        method: "POST",
        body: img
      }
    );
    const data = await res.json();
    return data.secure_url;
  }

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

    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }


    try {
      setLoading(true);

      // Fetching info from pincode
      const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const pinData = await pinRes.json();

      if (!pinData || pinData[0].Status !== "Success") {
        throw new Error("Invalid Pincode or service unavailable");
      }

      const district = pinData[0].PostOffice[0].District;
      const state = pinData[0].PostOffice[0].State;


      // CSRF Token
      const csrftoken = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include"
      })
      const csrfData = await csrftoken.json();
      if (!csrfData || !csrfData.csrfToken) {
        throw new Error("CSRF Token not found");
      }


      //POST the details 
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/me/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.fullName,
            phone: formData.phone,
            roles: intent,
            address: {
              district: district,
              state: state,
              pincode: pincode
            },
            profileImage: profileImage ? await convertImage(profileImage) : previewUrl
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      switchMode("success");
      toast.success("Profile Completed Successfully 🚀");

    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-y-auto">

        {/* LEFT */}
        <div className="bg-app/80 p-8 flex flex-col items-center justify-center space-y-8 border-r border-white/5">

          <div className="relative group cursor-pointer" onClick={triggerFileInput}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 group-hover:border-bright transition-colors overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-zinc-600 group-hover:scale-110 group-hover:text-bright transition-all" />
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-1 right-1 rounded-full bg-bright p-2.5 shadow-lg hover:bg-bright transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
            >
              <Camera className="w-4 h-4 text-surface hover:cursor-pointer" />
            </button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
              Profile Identity
            </p>
            <p className="text-xs text-zinc-400">Upload a professional photo</p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase ml-1 mb-2">
              I am here to...
            </p>

            <IntentCard
              active={intent === "renter"}
              title="Rent Items"
              subtitle="Browse and rent assets locally"
              icon={<ShoppingBasket className="w-5 h-5" />}
              onClick={() => setIntent("renter")}
            />

            <IntentCard
              active={intent === "owner"}
              title="List Assets"
              subtitle="Earn money by sharing your items"
              icon={<TrendingUp className="w-5 h-5" />}
              onClick={() => setIntent("owner")}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 space-y-6 bg-card">

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Complete Profile
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Fill in your details to join the community
            </p>
          </div>

          <div className="space-y-2">

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
              <label className="text-[10px] font-bold tracking-wider text-text-secondary uppercase ml-1">
                PHONE NUMBER
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className="w-full rounded-2xl bg-app border-2 border-card px-11 py-3.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-bright transition-all font-medium"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-bright hover:bg-bright/80 py-4 font-bold text-app shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-10"
          >
            <span>{loading ? "Processing..." : "Complete Setup"}</span>
            <ArrowRight className="w-5 h-5" />
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
      className={`w-full rounded-2xl p-4 text-left transition-all ${active
        ? "border-2 border-bright bg-bright/10"
        : "bg-app border border-zinc-700/50 hover:bg-zinc-800"
        } flex items-center gap-4`}
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${active ? "bg-bright text-white" : "bg-zinc-700 text-zinc-500"
        }`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm text-white">{title}</p>
        <p className="text-[11px] text-zinc-500 font-medium">{subtitle}</p>
      </div>
    </button>
  );
}

function Input({ label, placeholder, icon, name, value, onChange, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold tracking-wider text-text-secondary uppercase ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
          {icon}
        </div>
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
          className="w-full rounded-2xl bg-app border-2 border-card px-11 py-3.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-bright"
        />
      </div>
    </div>
  );
}