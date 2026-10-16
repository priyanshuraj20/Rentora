import { useState } from "react";
import { X, Package, ImagePlus, IndianRupee, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/authHook";

export default function AddItemModal({ onClose, onSubmit }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        itemName: "",
        category: "",
        description: "",
        dailyPrice: "",
        weeklyPrice: "",
        monthlyPrice: "",
        securityDeposit: "",
        images: []
    });

    const [locationType, setLocationType] = useState("profile"); // 'profile' | 'custom'
    const [customLocation, setCustomLocation] = useState({
        city: "",
        district: "",
        state: "",
        pincode: ""
    });

    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const updatedImages = [...formData.images, ...files].slice(0, 5);
        setFormData({
            ...formData,
            images: updatedImages
        });
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const uploadImagesToCloudinary = async (files) => {
        const uploadUrl = import.meta.env.VITE_CLOUDINARY_URL;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

        if (!uploadUrl || !uploadPreset) {
            throw new Error("Cloudinary credentials are not configured. Please check VITE_CLOUDINARY_URL and VITE_CLOUDINARY_PRESET.");
        }

        const uploadPromises = files.map(async (file) => {
            if (typeof file === "string") return file;

            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", uploadPreset);

            const response = await fetch(uploadUrl, {
                method: "POST",
                body: data,
            });
            const resData = await response.json();
            if (!response.ok || !resData.secure_url) {
                const errMsg = resData?.error?.message || response.statusText || "Failed to upload image to Cloudinary";
                throw new Error(errMsg);
            }
            return resData.secure_url;
        });

        const urls = await Promise.all(uploadPromises);
        return urls.filter((url) => typeof url === "string" && url.trim().length > 0);
    };

    const addItemToBackend = async (data) => {
        try {
            const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
                method: "GET",
                credentials: "include"
            });
            const { csrfToken } = await csrfRes.json();

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to add item");

            return result;
        } catch (error) {
            console.error("Backend error:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { dailyPrice, weeklyPrice, monthlyPrice, securityDeposit, itemName, category, description } = formData;

        const isValidNumber = (value) =>
            value === "" || /^[0-9]+(\.[0-9]+)?$/.test(value);

        if (!isValidNumber(dailyPrice)) {
            toast.error("Daily price must be a valid number");
            return;
        }

        if (!isValidNumber(weeklyPrice)) {
            toast.error("Weekly price must be a valid number");
            return;
        }

        if (!isValidNumber(monthlyPrice)) {
            toast.error("Monthly price must be a valid number");
            return;
        }

        if (!isValidNumber(securityDeposit)) {
            toast.error("Security deposit must be a valid number");
            return;
        }

        if (!itemName) {
            toast.error("Item name is required");
            return;
        }

        if (!category) {
            toast.error("Category is required");
            return;
        }

        if (!description) {
            toast.error("Description is required");
            return;
        }
        if (!dailyPrice) {
            toast.error("Daily price is required");
            return;
        }

        if (!securityDeposit) {
            toast.error("Security deposit is required");
            return;
        }

        if (locationType === "custom") {
            if (!customLocation.city.trim()) {
                toast.error("Please enter a pickup city or town.");
                return;
            }
        } else {
            const hasAddress = !!(
                user?.address?.district ||
                user?.address?.state ||
                user?.address?.city ||
                user?.address?.pincode
            );
            if (!hasAddress) {
                toast.error("No profile address found. Please select 'Use Different Pickup Location' or update your profile.");
                return;
            }
        }

        if (!formData.images || formData.images.length === 0) {
            toast.error("Please select at least one image.");
            return;
        }

        setIsUploading(true);
        try {
            const imageUrls = await uploadImagesToCloudinary(formData.images);
            if (!imageUrls || imageUrls.length === 0) {
                throw new Error("No images were successfully uploaded. Please try again.");
            }

            const finalData = {
                title: formData.itemName,
                description: formData.description,
                category: formData.category,
                price: {
                    daily: Number(formData.dailyPrice),
                    weekly: Number(formData.weeklyPrice) || 0,
                    monthly: Number(formData.monthlyPrice) || 0
                },
                securityDeposit: Number(formData.securityDeposit),
                images: imageUrls,
                ...(locationType === "custom" && {
                    location: {
                        city: customLocation.city.trim(),
                        district: customLocation.district.trim(),
                        state: customLocation.state.trim(),
                        pincode: customLocation.pincode.trim()
                    }
                })
            };

            await addItemToBackend(finalData);

            toast.success("Item added successfully! 🚀");
            if (onSubmit) {
                onSubmit(finalData);
            }
            onClose();
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.message || "Failed to add item. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl relative animate-[modalIn_0.15s_ease-out] border border-divider"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-divider">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <Package size={20} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary tracking-tight">Add New Item</h2>
                            <p className="text-xs text-text-muted font-medium">List a new item for rent</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Item Name & Category Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                                Item Name<span className="text-bright"> *</span>
                            </label>
                            <input
                                type="text"
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleChange}
                                placeholder="e.g. Sony A7III Camera"
                                className="w-full bg-card border border-divider rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                                Category<span className="text-bright"> *</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-card border border-divider rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all appearance-none"
                                required
                            >
                                <option value="" className="bg-card text-text-muted">Select Category</option>
                                <option value="Photography" className="bg-card">Photography</option>
                                <option value="Electronics" className="bg-card">Electronics</option>
                                <option value="Furniture" className="bg-card">Furniture</option>
                                <option value="Sports" className="bg-card">Sports</option>
                                <option value="Vehicles" className="bg-card">Vehicles</option>
                                <option value="Tools" className="bg-card">Tools</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                            Description<span className="text-bright"> *</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell renters about your item, its condition, and what's included..."
                            rows="3"
                            className="w-full bg-card border border-divider rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all resize-none"
                            required
                        />
                    </div>

                    {/* Pickup Location Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={14} className="text-bright" />
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Pickup Location
                            </span>
                        </div>

                        <div className="space-y-3 bg-card border border-divider p-4 rounded-xl">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="locationType"
                                    value="profile"
                                    checked={locationType === "profile"}
                                    onChange={() => setLocationType("profile")}
                                    className="mt-0.5 accent-bright cursor-pointer"
                                />
                                <div>
                                    <span className="text-xs font-bold text-text-primary">
                                        ✓ Same as Profile Address
                                    </span>
                                    {user?.address?.district || user?.address?.state ? (
                                        <p className="text-xs text-text-muted mt-0.5">
                                            📍 {user.address.district || ""}{user.address.state ? `, ${user.address.state}` : ""} ({user.address.pincode || "No Pincode"})
                                        </p>
                                    ) : (
                                        <p className="text-[11px] text-amber-400 mt-0.5 font-medium">
                                            ⚠️ No saved address in profile. Please select 'Use Different Pickup Location' below.
                                        </p>
                                    )}
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="locationType"
                                    value="custom"
                                    checked={locationType === "custom"}
                                    onChange={() => setLocationType("custom")}
                                    className="accent-bright cursor-pointer"
                                />
                                <span className="text-xs font-bold text-text-primary">
                                    ○ Use Different Pickup Location
                                </span>
                            </label>

                            {locationType === "custom" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-divider/60">
                                    <div>
                                        <label className="block text-[11px] font-medium text-text-muted mb-1">
                                            City / Town <span className="text-bright">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={customLocation.city}
                                            onChange={(e) => setCustomLocation({ ...customLocation, city: e.target.value })}
                                            placeholder="e.g. Ahmedabad"
                                            className="w-full bg-surface border border-divider rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-bright"
                                            required={locationType === "custom"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-text-muted mb-1">
                                            District
                                        </label>
                                        <input
                                            type="text"
                                            value={customLocation.district}
                                            onChange={(e) => setCustomLocation({ ...customLocation, district: e.target.value })}
                                            placeholder="e.g. Vadodara"
                                            className="w-full bg-surface border border-divider rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-bright"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-text-muted mb-1">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={customLocation.state}
                                            onChange={(e) => setCustomLocation({ ...customLocation, state: e.target.value })}
                                            placeholder="e.g. Gujarat"
                                            className="w-full bg-surface border border-divider rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-bright"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-text-muted mb-1">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            value={customLocation.pincode}
                                            onChange={(e) => setCustomLocation({ ...customLocation, pincode: e.target.value })}
                                            placeholder="e.g. 390001"
                                            className="w-full bg-surface border border-divider rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-bright"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                            Upload Images
                        </label>

                        <label
                            htmlFor="imageUpload"
                            className="block border-2 border-dashed border-divider hover:border-bright/40 rounded-xl p-6 text-center cursor-pointer bg-card/50 hover:bg-bright/5 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-bright/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-bright/20 transition-colors">
                                <ImagePlus size={22} className="text-bright" />
                            </div>
                            <p className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                                Drag & drop or click to upload
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                JPG, PNG up to 10MB &middot; Max 5 images
                            </p>
                            {formData.images.length > 0 && (
                                <p className="text-xs text-bright font-bold mt-2">
                                    {formData.images.length} file{formData.images.length > 1 ? "s" : ""} selected
                                </p>
                            )}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="imageUpload"
                            />
                        </label>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                                {formData.images.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative group rounded-xl overflow-hidden border border-divider bg-card"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="preview"
                                            className="w-full h-20 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage(index);
                                            }}
                                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pricing Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <IndianRupee size={14} className="text-bright" />
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Pricing
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">
                                    Daily <span className="text-bright">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="dailyPrice"
                                        value={formData.dailyPrice}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">
                                    Weekly
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="weeklyPrice"
                                        value={formData.weeklyPrice}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">
                                    Monthly
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="monthlyPrice"
                                        value={formData.monthlyPrice}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">
                                    Deposit <span className="text-bright">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="securityDeposit"
                                        value={formData.securityDeposit}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-divider">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-secondary bg-card border border-divider hover:bg-elevated hover:text-text-primary transition-all"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary text-text-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-md"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-text-primary/30 border-t-text-primary rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            "Add Item"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}