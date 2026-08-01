import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/authHook";
import toast from "react-hot-toast";

import ImageGallery from "../../components/renter_ui/item_detail/ImageGallery";
import ItemSummaryCard from "../../components/renter_ui/item_detail/ItemSummaryCard";
import OwnerCard from "../../components/renter_ui/item_detail/OwnerCard";
import ItemDescription from "../../components/renter_ui/item_detail/ItemDescription";
import ItemSpecs from "../../components/renter_ui/item_detail/ItemSpecs";
import RentalGuidelines from "../../components/renter_ui/item_detail/RentalGuidelines";

const RenterItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { user } = useAuth();

  const fetchWishlistStatus = useCallback(async () => {
    try {
      if (!user) return;

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/wishlist`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const isInWishlist = data.data.some(wItem => wItem.id === id);
        setIsWishlisted(isInWishlist);
      }
    } catch (err) {
      console.error("Error fetching wishlist status:", err);
    }
  }, [user, id]);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/explore/${id}`);
      const data = await res.json();
      
      if (data.status === "success" || data.success) {
        const itemData = data.item || data.data;
        if (itemData) {
          setItem(itemData);
        } else {
          setError("Item details not found in response");
        }
      } else {
        setError(data.message || "Failed to fetch item details");
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  useEffect(() => {
    if (user && item) {
      fetchWishlistStatus();
    }
  }, [user, item, fetchWishlistStatus]);

  const handleToggleWishlist = async () => {
    try {
      if (!user) {
        toast.error("Please login to use wishlist");
        return;
      }

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
        body: JSON.stringify({ itemId: id })
      });
      const data = await response.json();
      if (data.success) {
        setIsWishlisted(prev => !prev);
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-background-dark">
        <h2 className="text-2xl font-bold text-text-primary">
          {error || "Item not found"}
        </h2>
        <p className="text-text-secondary">
          The item might have been removed or is no longer available.
        </p>
        <button 
          onClick={fetchItem}
          className="mt-4 px-6 py-2 bg-app text-white rounded-lg hover:bg-app/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Backwards compatibility for components that might expect certain fields
  const formattedItem = {
    ...item,
    image: item.images?.[0] || item.image || "",
    pricing: item.pricing || item.price || { daily: 0 },
    specs: item.specs || [
      { label: "Category", value: item.category },
      { label: "Availability", value: "Instant" },
    ],
    guidelines: item.guidelines || [
      "Return the item in the same condition it was received.",
      "Inform the owner of any damage immediately.",
      "Late returns may incur extra charges.",
    ]
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-20 py-10 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
      {/* LEFT */}
      <div className="flex flex-col gap-8">
        <ImageGallery image={formattedItem.image} />
        <ItemDescription description={formattedItem.description} />
        <ItemSpecs specs={formattedItem.specs} />
        <RentalGuidelines rules={formattedItem.guidelines} />
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-6">
        <ItemSummaryCard 
          item={formattedItem} 
          isWishlisted={isWishlisted} 
          onToggleWishlist={handleToggleWishlist} 
        />
        {formattedItem.owner && <OwnerCard owner={formattedItem.owner} />}
      </div>
    </div>
  );
};

export default RenterItemDetails;

