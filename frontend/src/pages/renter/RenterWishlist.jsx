import WishlistHeader from "../../components/renter_ui/wishlist/WishlistHeader";
import WishlistTabs from "../../components/renter_ui/wishlist/WishlistTabs";
import WishlistGrid from "../../components/renter_ui/wishlist/WishlistGrid";
import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";

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
            // Fetch CSRF Token
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
                <Loader2 className="w-10 h-10 animate-spin text-app" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-text-primary px-4">
                <p className="text-xl font-semibold mb-2">Oops!</p>
                <p className="text-text-secondary">{error}</p>
                <button 
                    onClick={fetchWishlist}
                    className="mt-4 px-6 py-2 bg-app text-white rounded-lg hover:bg-app/90 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto bg-background-dark">
            <div className="max-w-[1200px] mx-auto px-8 py-10">
                <WishlistHeader
                    title="Your Saved Items"
                    subtitle="Premium gear waiting for your next project."
                    total={filteredItems.length}
                />

                <WishlistTabs activeTab={activeTab} onChange={setActiveTab} />

                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-divider">
                        <p className="text-text-secondary text-lg">
                            {activeTab === "available" 
                                ? "No available items in your wishlist right now." 
                                : "Your wishlist is empty. Explore and save some items!"}
                        </p>
                    </div>
                ) : (
                    <WishlistGrid items={filteredItems} onRemove={handleRemoveFromWishlist} />
                )}
            </div>
        </main>
    );
}

