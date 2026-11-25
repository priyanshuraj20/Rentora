import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RentCheckoutLayout from "../../components/renter_ui/rent_checkout/RentCheckoutLayout";

export default function RentCheckout() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Item
                const itemRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/explore/${id}`);
                const itemData = await itemRes.json();
                
                if (itemData.status === "success") {
                    setItem(itemData.item);
                } else {
                    throw new Error(itemData.message || "Failed to fetch item details");
                }

                // Fetch User Profile for Address (if logged in)
                try {
                    const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/me/profile`, {
                        credentials: "include"
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        if (userData.success) {
                            setUser(userData.user);
                        }
                    }
                } catch (_) {
                    // Guest user without active session
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Network error. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center px-4">
                <div className="size-16 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary text-2xl mb-1">
                    ⚠️
                </div>
                <h2 className="text-2xl font-bold text-text-primary">
                    {error || "Item not found"}
                </h2>
                <p className="text-text-secondary max-w-md">
                    We couldn't load the item for checkout. It may have been unlisted or unavailable.
                </p>
                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={() => window.history.back()}
                        className="px-5 py-2.5 rounded-xl bg-app border border-divider text-text-secondary hover:text-text-primary text-xs font-semibold cursor-pointer"
                    >
                        ← Go Back
                    </button>
                    <a
                        href="/explore"
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold cursor-pointer"
                    >
                        Browse All Gear →
                    </a>
                </div>
            </div>
        );
    }

    // Format item to match expected structure in CostSummary.jsx
    const formattedItem = {
        ...item,
        pricing: item.pricing || item.price || { daily: 0, weekly: 0, monthly: 0 },
        securityDeposit: Number(item.securityDeposit || 0),
        booking: {
            securityDeposit: Number(item.securityDeposit || 0),
            serviceFee: 0,
            discounts: {
                monthlyPercent: 0,
                weeklyPercent: 0,
            },
            protection: {
                included: true,
                coverageAmount: (item.pricing?.daily || item.price?.daily || 0) * 100 || 50000,
            }
        }
    };

    return (
        <RentCheckoutLayout
            item={formattedItem}
            user={user}
            availability={{
                disabledDates: item.unavailableDates || []
            }}
        />
    );
}
