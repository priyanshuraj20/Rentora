import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { apiClient } from "../../utils/apiClient";
import Breadcrumbs from "../../components/renter_ui/rental_details/Breadcrumbs";
import RentalHero from "../../components/renter_ui/rental_details/RentalHero";
import RentalProgress from "../../components/renter_ui/rental_details/RentalProgress";
import FinancialBreakdown from "../../components/renter_ui/rental_details/FinancialBreakdown";
import OwnerInfo from "../../components/renter_ui/rental_details/OwnerInfo";
import RentalPolicies from "../../components/renter_ui/rental_details/RentalPolicies";
import RentalActions from "../../components/renter_ui/rental_details/RentalActions";
import ActivityTimeline from "../../components/renter_ui/rental_details/ActivityTimeline";
import BookingPhotoUploadModal from "../../components/common/BookingPhotoUploadModal";
import PINDisplayModal from "../../components/common/PINDisplayModal";
import PINInputModal from "../../components/common/PINInputModal";

export default function RentalDetails() {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showPINInputModal, setShowPINInputModal] = useState(false);
  const [showPINDisplayModal, setShowPINDisplayModal] = useState(false);

  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/booking/${rentalId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch rental details");
      }

      const data = await response.json();
      const booking = data.booking;

      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      const now = new Date();
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const progressPercent = Math.max(
        0,
        Math.min(100, (elapsed / totalDuration) * 100)
      );

      const diffTime = end.getTime() - now.getTime();
      const daysRemaining = Math.max(
        0,
        Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      );

      const mappedRental = {
        id: booking._id,
        status: booking.booking_status,
        paymentStatus: booking.payment_status || "pending",
        handoverPhotos: booking.handoverPhotos || [],
        returnPhotos: booking.returnPhotos || [],
        handoverConfirmedAt: booking.handoverConfirmedAt,
        returnConfirmedAt: booking.returnConfirmedAt,
        title: booking.item_id?.title || "Unknown Item",
        location: booking.address
          ? `${booking.address.district}, ${booking.address.state}`
          : "Location not available",
        image:
          booking.item_id?.images?.[0] ||
          "https://via.placeholder.com/400x300?text=No+Image",
        rentalType: booking.pricing?.appliedPricing || "Daily",
        agreementDate: new Date(booking.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        startDate: new Date(booking.start_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        endDate: new Date(booking.end_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        progressPercent: Math.round(progressPercent),
        daysRemaining: daysRemaining,
        damageReport: booking.damageReport || null,
        depositSettlement: booking.depositSettlement || null,
        pricing: {
          dailyRate: booking.pricing?.baseRate || 0,
          durationDays: booking.total_days || 0,
          subtotal: booking.pricing?.subtotal || 0,
          deposit: booking.pricing?.securityDeposit || 0,
          totalPaid: booking.pricing?.totalAmount || 0,
        },
        owner: {
          name: booking.owner_id?.name || "Private Owner",
          rating: 4.8,
          reviews: 42,
          avatar:
            booking.owner_id?.profileImage ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(booking.owner_id?.name || "PO") +
              "&background=random",
        },
        policies: [
          {
            title: "Late Return Policy",
            description: "₹50/hr charge after 2 hours delay.",
            icon: "history",
          },
          {
            title: "Damage Policy",
            description: "Security deposit covers minor incidental damages.",
            icon: "shield",
          },
        ],
        timeline: [
          {
            id: 1,
            title: "Request Submitted",
            description: new Date(booking.createdAt).toLocaleString(),
            type: "info",
          },
          ...(booking.booking_status !== "pending" && booking.booking_status !== "cancelled" && booking.booking_status !== "rejected"
            ? [
                {
                  id: 2,
                  title: "Owner Approved",
                  description: "Your request was approved by the owner.",
                  type: "success",
                },
              ]
            : []),
          ...(booking.payment_status === "paid" || booking.booking_status === "confirmed" || booking.booking_status === "ongoing" || booking.booking_status === "completed"
            ? [
                {
                  id: 3,
                  title: "Payment Verified & Confirmed",
                  description: "Payment completed successfully.",
                  type: "success",
                },
              ]
            : []),
        ],
      };

      setRental(mappedRental);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalDetails();
  }, [rentalId]);

  const handleCompletePayment = async () => {
    try {
      setIsPaymentSubmitting(true);

      const orderRes = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/payments/create-order`,
        {
          method: "POST",
          body: JSON.stringify({ bookingId: rental.id }),
        }
      );

      const orderResult = await orderRes.json();
      if (!orderResult.success) {
        throw new Error(orderResult.message || "Failed to create payment order");
      }

      const { orderId, amount, currency, keyId } = orderResult.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Rentora Rental",
        description: `Escrow Security Deposit for ${rental.title}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await apiClient(
              `${import.meta.env.VITE_BACKEND_URL}/payments/verify`,
              {
                method: "POST",
                body: JSON.stringify({
                  bookingId: rental.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Payment verified! Booking is now CONFIRMED. 🎉");
              await fetchRentalDetails();
            } else {
              toast.error(verifyData.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            toast.error("Payment verification failed");
          } finally {
            setIsPaymentSubmitting(false);
          }
        },
        theme: {
          color: "#3B82F6",
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Razorpay SDK failed to load. Please refresh and try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 px-6 py-10 max-w-[900px] mx-auto flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-bright border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-bold">Loading rental details...</p>
        </div>
      </main>
    );
  }

  if (error || !rental) {
    return (
      <main className="flex-1 px-6 py-10 max-w-[900px] mx-auto flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-6">
          <div className="size-20 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red text-4xl">error</span>
          </div>
          <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
          <p className="text-text-secondary max-w-md mx-auto">
            {error || "Could not find the rental details you're looking for."}
          </p>
          <button
            onClick={() => navigate("/rentals")}
            className="bg-bright text-surface px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer"
          >
            Back to My Rentals
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-[900px] mx-auto space-y-6">
      <Breadcrumbs />
      <RentalHero rental={rental} />
      <RentalProgress rental={rental} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialBreakdown
          pricing={rental.pricing}
          paymentStatus={rental.paymentStatus}
          status={rental.status}
          onCompletePayment={handleCompletePayment}
          isSubmitting={isPaymentSubmitting}
        />
        <div className="flex flex-col gap-6">
          <OwnerInfo owner={rental.owner} bookingId={rental.id} />
          <RentalPolicies policies={rental.policies} />
        </div>
      </div>

      {(rental.status === "confirmed" || rental.status === "ongoing") &&
        (!rental.handoverPhotos || rental.handoverPhotos.length === 0) && (
          <div className="bg-surface border border-divider rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text-primary">Pickup Condition Photos</p>
              <p className="text-xs text-text-secondary">Upload item condition photos at handover for protection.</p>
            </div>
            <button
              onClick={() => setShowHandoverModal(true)}
              className="bg-primary hover:bg-primary-hover text-text-primary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              📷 Upload Pickup Photos
            </button>
          </div>
        )}

      {((rental.handoverPhotos && rental.handoverPhotos.length > 0) || (rental.returnPhotos && rental.returnPhotos.length > 0)) && (
        <div className="bg-surface border border-divider rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Condition Photos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rental.handoverPhotos && rental.handoverPhotos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-secondary">Pickup / Handover Photos</h4>
                <div className="flex flex-wrap gap-2">
                  {rental.handoverPhotos.map((photo, idx) => (
                    <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="relative group overflow-hidden rounded-xl border border-divider">
                      <img src={photo.url} alt={`Handover ${idx}`} className="size-20 object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {rental.returnPhotos && rental.returnPhotos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-secondary">Return Photos</h4>
                <div className="flex flex-wrap gap-2">
                  {rental.returnPhotos.map((photo, idx) => (
                    <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="relative group overflow-hidden rounded-xl border border-divider">
                      <img src={photo.url} alt={`Return ${idx}`} className="size-20 object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Damage Audit & Escrow Settlement Card */}
      {(rental.depositSettlement || rental.damageReport) && (
        <div className="bg-surface border border-divider rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary tracking-tight">
                  Gemini AI Damage Audit & Escrow Settlement
                </h3>
                <p className="text-xs text-text-secondary">
                  Automated condition inspection comparing pickup vs return condition
                </p>
              </div>
            </div>

            {/* Severity Badge */}
            {rental.damageReport && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  rental.damageReport.tier === "TIER_0"
                    ? "bg-success/15 text-success border border-success/30"
                    : rental.damageReport.tier === "TIER_1"
                    ? "bg-warning/15 text-warning border border-warning/30"
                    : "bg-error/15 text-error border border-error/30"
                }`}
              >
                {rental.damageReport.tier === "TIER_0"
                  ? "Tier 0 • Pristine Condition"
                  : rental.damageReport.tier === "TIER_1"
                  ? "Tier 1 • Minor Cosmetic Wear"
                  : rental.damageReport.tier === "TIER_2"
                  ? "Tier 2 • Moderate Damage"
                  : "Tier 3 • Severe Damage (Locked)"}
              </span>
            )}
          </div>

          {/* AI Findings Summary */}
          {rental.damageReport && (
            <div className="bg-app border border-divider rounded-2xl p-4 space-y-2 text-xs">
              <p className="font-semibold text-text-primary">
                {rental.damageReport.summary}
              </p>
              {rental.damageReport.findings?.length > 0 && (
                <ul className="space-y-1 text-text-secondary list-disc list-inside">
                  {rental.damageReport.findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Settlement Breakdown */}
          {rental.depositSettlement && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-app p-4 rounded-2xl border border-divider">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
                  Total Security Deposit
                </span>
                <p className="text-lg font-bold text-text-primary mt-1">
                  ₹{rental.depositSettlement.totalDeposit}
                </p>
              </div>

              <div className="bg-app p-4 rounded-2xl border border-divider">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
                  Repair Deduction
                </span>
                <p className="text-lg font-bold text-error mt-1">
                  -₹{rental.depositSettlement.repairDeduction}
                </p>
              </div>

              <div className="bg-app p-4 rounded-2xl border border-success/30 bg-success/5">
                <span className="text-[11px] text-success font-bold uppercase tracking-wider">
                  Refunded to Renter (Razorpay)
                </span>
                <p className="text-lg font-bold text-success mt-1">
                  +₹{rental.depositSettlement.refundedToRenter}
                </p>
                {rental.depositSettlement.razorpayRefundId && (
                  <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">
                    Ref: {rental.depositSettlement.razorpayRefundId}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <RentalActions
        status={rental.status}
        handoverConfirmedAt={rental.handoverConfirmedAt}
        returnConfirmedAt={rental.returnConfirmedAt}
        onEnterHandoverPin={() => setShowPINInputModal(true)}
        onShowReturnPin={() => setShowPINDisplayModal(true)}
      />
      <ActivityTimeline timeline={rental.timeline} />

      {showHandoverModal && (
        <BookingPhotoUploadModal
          bookingId={rental.id}
          type="handover"
          onClose={() => setShowHandoverModal(false)}
          onSuccess={() => {
            setShowHandoverModal(false);
            fetchRentalDetails();
          }}
        />
      )}

      {showPINInputModal && (
        <PINInputModal
          bookingId={rental.id}
          type="handover"
          open={showPINInputModal}
          onClose={() => setShowPINInputModal(false)}
          onSuccess={fetchRentalDetails}
        />
      )}

      {showPINDisplayModal && (
        <PINDisplayModal
          bookingId={rental.id}
          type="return"
          open={showPINDisplayModal}
          onClose={() => setShowPINDisplayModal(false)}
        />
      )}
    </main>
  );
}
