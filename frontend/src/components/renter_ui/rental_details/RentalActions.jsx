import { useState } from "react";
import toast from "react-hot-toast";
import { X, ShieldCheck, Clock } from "lucide-react";

export default function RentalActions({ status }) {
  const [showReturnModal, setShowReturnModal] = useState(false);

  const handleRequestExtension = () => {
    toast("Rental extension feature is coming soon!", { icon: "⏳" });
  };

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={handleRequestExtension}
          className="flex-1 bg-accent/10 border border-accent/30 hover:bg-accent/20 text-white py-3 rounded-xl font-bold transition-all cursor-pointer"
        >
          Request Extension
        </button>
        <button
          onClick={() => setShowReturnModal(true)}
          className="flex-1 bg-surface border-1 border-app/80 hover:border-bright/40 text-text-primary py-3 rounded-xl font-bold transition-all cursor-pointer"
        >
          View Return Instructions
        </button>
      </div>

      {showReturnModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-app/80 rounded-2xl max-w-md w-full p-6 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-divider/20 pb-4">
              <ShieldCheck className="text-bright size-6" />
              <h3 className="text-xl font-bold text-white">Return Instructions</h3>
            </div>

            {status === "confirmed" || status === "ongoing" || status === "completed" ? (
              <div className="space-y-4 text-sm text-text-secondary">
                <div className="flex items-start gap-3 bg-app/50 p-3 rounded-xl border border-divider/10">
                  <span className="font-bold text-bright">1.</span>
                  <p>Clean the item and pack all original accessories, chargers, and manuals.</p>
                </div>
                <div className="flex items-start gap-3 bg-app/50 p-3 rounded-xl border border-divider/10">
                  <span className="font-bold text-bright">2.</span>
                  <p>Return the item to the owner's pickup location by the specified end date.</p>
                </div>
                <div className="flex items-start gap-3 bg-app/50 p-3 rounded-xl border border-divider/10">
                  <span className="font-bold text-bright">3.</span>
                  <p>The owner will inspect the item and mark the booking as returned/completed.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-400 text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Clock size={18} />
                  <span>Instructions Pending Approval</span>
                </div>
                <p className="text-xs text-amber-400/80">
                  Return instructions become available after the owner approves your booking and the rental becomes active.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowReturnModal(false)}
              className="w-full bg-bright text-app font-bold py-3 rounded-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
