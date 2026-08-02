import { useState, useEffect, useMemo } from "react";
import WishlistHeader from "../../components/renter_ui/wishlist/WishlistHeader";
import WishlistTabs from "../../components/renter_ui/wishlist/WishlistTabs";
import WishlistGrid from "../../components/renter_ui/wishlist/WishlistGrid";
import { Loader2, HeartOff } from "lucide-react";

export default function RenterWishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/wishlist`, {
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) {
                setWishlistItems(data.data);
            } else {
                setError(data.message || "Failed to fetch wishlist");
            }
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = async (itemId) => {
        try {
            const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
                method: "GET",
                credentials: "include"
            });
            const csrfData = await csrfRes.json();

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/wishlist/toggle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfData.csrfToken
                },
                credentials: "include",
                body: JSON.stringify({ itemId })
            });
            const data = await response.json();
            if (data.success) {
                setWishlistItems(prev => prev.filter(item => item.id !== itemId));
            }
        } catch (err) {
            console.error("Error toggling wishlist:", err);
        }
    };

    const filteredItems = useMemo(() => {
        if (activeTab === "available") {
            return wishlistItems.filter((item) => item.available);
        }
        return wishlistItems;
    }, [activeTab, wishlistItems]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-text-primary px-4">
                <p className="text-xl font-bold mb-2">Oops!</p>
                <p className="text-text-secondary text-sm">{error}</p>
                <button 
                    onClick={fetchWishlist}
                    className="mt-4 px-6 py-2.5 bg-primary text-text-primary font-semibold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto bg-app min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6 py-8">
                <WishlistHeader
                    title="Your Saved Items"
                    subtitle="Premium gear waiting for your next project."
                    total={filteredItems.length}
                />

                <WishlistTabs activeTab={activeTab} onChange={setActiveTab} />

                {filteredItems.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-surface rounded-3xl border border-divider max-w-md mx-auto shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-card border border-divider flex items-center justify-center mx-auto mb-4 text-text-muted">
                            <HeartOff size={24} />
                        </div>
                        <h3 className="text-base font-bold text-text-primary mb-1">Your wishlist is empty</h3>
                        <p className="text-xs text-text-secondary">
                            {activeTab === "available" 
                                ? "No available items in your wishlist right now." 
                                : "Explore available items and tap the heart icon to save them!"}
                        </p>
                    </div>
                ) : (
                    <WishlistGrid items={filteredItems} onRemove={handleRemoveFromWishlist} />
                )}
            </div>
        </main>
    );
}
