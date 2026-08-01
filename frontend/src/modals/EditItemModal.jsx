import { useState, useEffect } from "react";
import { X, ChevronDown, ImagePlus, Package, IndianRupee, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/authHook";

export default function EditItemModal({ item, onClose, onSubmit }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        itemName: "",
        category: "",
        description: "",
        images: [],
        dailyPrice: "",
        weeklyPrice: "",
        monthlyPrice: "",
        securityDeposit: ""
    });

    const [locationType, setLocationType] = useState("profile"); // 'profile' | 'custom'
    const [customLocation, setCustomLocation] = useState({
        city: "",
        district: "",
        state: "",
        pincode: ""
    });

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                itemName: item.title || "",
                category: item.category || "",
                description: item.description || "",
                images: item.images || (item.image ? [item.image] : []),
                dailyPrice: item.price?.daily || item.price || "",
                weeklyPrice: item.price?.weekly || item.weeklyPrice || "0",
                monthlyPrice: item.price?.monthly || item.monthlyPrice || "0",
                securityDeposit: item.securityDeposit || "0"
            });

            if (item.location?.city) {
                setLocationType("custom");
                setCustomLocation({
                    city: item.location.city || "",
                    district: item.location.district || "",
                    state: item.location.state || "",
                    pincode: item.location.pincode || ""
                });
            } else {
                setLocationType("profile");
            }
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const updatedImages = [...formData.images, ...files].slice(0, 5);
        setFormData(prev => ({
            ...prev,
            images: updatedImages
        }));
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const uploadImagesToCloudinary = async (images) => {
        const uploadUrl = import.meta.env.VITE_CLOUDINARY_URL;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

        const uploadPromises = images.map(async (img) => {
            if (typeof img === "string") return img;

            const data = new FormData();
            data.append("file", img);
            data.append("upload_preset", uploadPreset);

            try {
                const response = await fetch(uploadUrl, {
                    method: "POST",
                    body: data,
                });
                const resData = await response.json();
                return resData.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return null;
            }
        });

        const urls = await Promise.all(uploadPromises);
        return urls.filter(url => url !== null);
    };

    const updateItem = async (data) => {
        try {
            const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
                method: "GET",
                credentials: "include"
            });
            const { csrfToken } = await csrfRes.json();

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/items/${item.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to update item");
            
            return result;
        } catch (error) {
            console.error("Backend error:", error);
            throw error;
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (locationType === "custom") {
            if (!customLocation.city.trim()) {
                toast.error("Please enter a pickup city or town.");
                return;
            }
        } else {
            if (!user?.address?.district && !user?.address?.state) {
                toast.error("No profile address found. Please select 'Use Different Pickup Location' or update your profile.");
                return;
            }
        }

        setIsUploading(true);
        try {
            const imageUrls = await uploadImagesToCloudinary(formData.images);
            const finalData = {
                title: formData.itemName,
                description: formData.description,
                category: formData.category,
                price: {
                    daily: Number(formData.dailyPrice),
                    weekly: Number(formData.weeklyPrice) || 0,
                    monthly: Number(formData.monthlyPrice) || 0
                },
                securityDeposit: Number(formData.securityDeposit) || 0,
                images: imageUrls.filter(url => url !== null).length > 0 ? imageUrls.filter(url => url !== null) : undefined,
                ...(locationType === "custom" && {
                    location: {
                        city: customLocation.city.trim(),
                        district: customLocation.district.trim(),
                        state: customLocation.state.trim(),
                        pincode: customLocation.pincode.trim()
                    }
                })
            };

            await updateItem(finalData);

            toast.success("Item updated successfully! 🚀");
            if (onSubmit) onSubmit(finalData);
            onClose();
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.message || "Failed to update item. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
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
                            <h2 className="text-lg font-bold text-text-primary tracking-tight">Edit Item</h2>
                            <p className="text-xs text-text-muted font-medium">Update your listing details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    <div className="pt-2">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Item Name</label>
                                <input
                                    type="text"
                                    name="itemName"
                                    value={formData.itemName}
                                    onChange={handleChange}
                                    className="w-full bg-card border border-divider rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all font-medium"
                                    placeholder="Enter item name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Category</label>
                                <div className="relative group">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all appearance-none cursor-pointer font-medium"
                                        required
                                    >
                                        <option value="" className="bg-card text-text-muted">Select Category</option>
                                        <option value="Photography" className="bg-card">Photography</option>
                                        <option value="Electronics" className="bg-card">Electronics</option>
                                        <option value="Furniture" className="bg-card">Furniture</option>
                                        <option value="Sports" className="bg-card">Sports</option>
                                        <option value="Vehicles" className="bg-card">Vehicles</option>
                                        <option value="Tools" className="bg-card">Tools</option>
                                        <option value="Music" className="bg-card">Music</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-card border border-divider rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all resize-none font-medium"
                                placeholder="Describe your item..."
                            />
                        </div>
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

                    {/* Image */}
                    <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Images</label>
                        <div className="flex flex-wrap gap-3">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative w-28 h-20 rounded-xl overflow-hidden border border-divider group bg-card">
                                    <img 
                                        src={typeof img === "string" ? img : URL.createObjectURL(img)} 
                                        alt="item" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-divider bg-card/50 hover:bg-bright/5 hover:border-bright/40 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer">
                                <div className="p-1 bg-bright/10 rounded-lg ">
                                    <ImagePlus size={20} className="text-bright" />
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 pb-2">
                        <div className="flex items-center gap-1 mb-4">
                            <IndianRupee size={14} className="text-bright font-black" />
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Pricing</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1.5">Daily Rate</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="dailyPrice"
                                        value={formData.dailyPrice}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1.5">Weekly Rate</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="weeklyPrice"
                                        value={formData.weeklyPrice}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1.5">Monthly Rate</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="monthlyPrice"
                                        value={formData.monthlyPrice}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1.5">Security Deposit</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                                    <input
                                        type="text"
                                        name="securityDeposit"
                                        value={formData.securityDeposit}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-divider rounded-xl pl-7 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-bright focus:ring-1 focus:ring-bright/30 transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-divider">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-secondary bg-card border border-divider hover:bg-elevated hover:text-text-primary transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary text-text-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-md"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-text-primary/30 border-t-text-primary rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
