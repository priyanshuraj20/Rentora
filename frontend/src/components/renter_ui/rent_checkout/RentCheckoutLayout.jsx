import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import RentalCalendar from "./RentalCalendar";
import RentalDuration from "./RentalDuration";
import CostSummary from "./CostSummary";
import { apiClient } from "../../../utils/apiClient";
import useAuth from "../../../hooks/authHook";
import AuthController from "../../auth/AuthController";

export default function RentCheckoutLayout({ item, availability, user }) {
  const { user: authUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchParams] = useSearchParams();
  const paramStart = searchParams.get("start");
  const paramEnd = searchParams.get("end");

  const [startDate, setStartDate] = useState(() => {
    if (paramStart) {
      const d = new Date(paramStart);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  });

  const [endDate, setEndDate] = useState(() => {
    if (paramEnd) {
      const d = new Date(paramEnd);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRequestBooking = async (totalAmount, breakdown) => {
    if (!startDate || !endDate) {
      setError("Please select rental dates");
      return;
    }

    if (!authUser) {
      toast("Please register or log in as a Renter to complete your booking.", { icon: "🔐" });
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create Booking using centralized apiClient
      const bookingRes = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/booking`, {
        method: "POST",
        body: JSON.stringify({
          itemId: item.id || item._id,
          ownerId: item.owner?.id || item.ownerId || item.owner_id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          address: {
            district: user?.address?.district || user?.address?.city || "Bangalore",
            state: user?.address?.state || "Karnataka",
            pincode: user?.address?.pincode || "560001"
          },
          pricing: {
            baseRate: breakdown.rentalFee,
            discountApplied: 0,
            securityDeposit: breakdown.securityDeposit,
            tax: 0,
            platformFee: 0,
            totalAmount: totalAmount
          }
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        throw new Error(bookingData.message || "Failed to create booking request");
      }

      toast.success("Booking request sent to owner for approval! 📩");
      navigate("/rentals");

    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Failed to process booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app text-white px-8 py-10 pt-30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}
          <RentalCalendar
            disabledDates={availability.disabledDates}
            initialStart={startDate}
            initialEnd={endDate}
            onSelect={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setError(null);
            }}
          />

          <RentalDuration
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* RIGHT */}
        <CostSummary
          item={item}
          startDate={startDate}
          endDate={endDate}
          onRequestBooking={handleRequestBooking}
          isSubmitting={isSubmitting}
        />
      </div>

      <AuthController
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="register"
      />
    </div>
  );
}
