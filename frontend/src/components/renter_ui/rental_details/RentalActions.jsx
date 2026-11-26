import { useState } from "react";
import toast from "react-hot-toast";
import { X, ShieldCheck, Clock, KeyRound, Camera } from "lucide-react";

export default function RentalActions({
  status,
  handoverConfirmedAt,
  returnConfirmedAt,
  hasHandoverPhotos = false,
  hasReturnPhotos = false,
  onUploadPhotos,
  onShowHandoverPin,
  onEnterReturnPin,
  onEnterHandoverPin,
  onShowReturnPin,
}) {
  const [showReturnModal, setShowReturnModal] = useState(false);

  const handleRequestExtension = () => {
    toast("Rental extension feature is coming soon!", { icon: "⏳" });
  };

  const handleHandoverClick = onShowHandoverPin || onShowReturnPin;
  const handleReturnClick = onEnterReturnPin || onEnterHandoverPin;

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {status === "confirmed" && !handoverConfirmedAt && (
          hasHandoverPhotos ? (
            <button
              onClick={handleHandoverClick}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/25 active:scale-95"
            >
              <KeyRound size={15} />
              <span>Show Handover PIN</span>
            </button>
          ) : (
            <button
              onClick={() => onUploadPhotos?.("handover")}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-primary/25 active:scale-95"
            >
              <Camera size={15} />
              <span>Upload Pickup Photos</span>
            </button>
          )
        )}
        {(status === "ongoing" || handoverConfirmedAt) && !returnConfirmedAt && status !== "completed" && (
          hasReturnPhotos ? (
            <button
              onClick={handleReturnClick}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-surface py-3 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-amber-500/25 active:scale-95"
            >
              <ShieldCheck size={15} />
              <span>Enter Owner's Return PIN</span>
            </button>
          ) : (
            <button
              disabled
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-amber-500/10 text-amber-400/70 border border-amber-500/20 py-3 px-4 rounded-2xl font-bold text-xs cursor-not-allowed"
              title="Owner must upload return inspection photos first"
            >
              <Clock size={15} />
              <span>Awaiting Owner Return Photos</span>
            </button>
          )
        )}
        <button
          onClick={handleRequestExtension}
          className="flex-1 min-w-[140px] bg-card border border-divider hover:bg-white/5 text-text-primary py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer"
        >
          Request Extension
        </button>
        <button
          onClick={() => setShowReturnModal(true)}
          className="flex-1 min-w-[140px] bg-surface border border-divider hover:border-primary/40 text-text-primary py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer"
        >
          View Return Instructions
        </button>
      </div>

      {showReturnModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-divider rounded-3xl max-w-md w-full p-6 space-y-6 relative animate-[modalIn_150ms_ease-out] shadow-2xl">
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-divider pb-4">
              <ShieldCheck className="text-primary size-5" />
              <h3 className="text-lg font-bold text-text-primary">Return Instructions</h3>
            </div>

            {status === "confirmed" || status === "ongoing" || status === "completed" ? (
              <div className="space-y-3 text-xs text-text-secondary">
                <div className="flex items-start gap-3 bg-app p-3 rounded-xl border border-divider">
                  <span className="font-bold text-primary">1.</span>
                  <p>Clean the item and pack all original accessories, chargers, and manuals.</p>
                </div>
                <div className="flex items-start gap-3 bg-app p-3 rounded-xl border border-divider">
                  <span className="font-bold text-primary">2.</span>
                  <p>Return the item to the owner's pickup location by the specified end date.</p>
                </div>
                <div className="flex items-start gap-3 bg-app p-3 rounded-xl border border-divider">
                  <span className="font-bold text-primary">3.</span>
                  <p>The owner will inspect the item and mark the booking as returned/completed.</p>
                </div>
              </div>
            ) : (
              <div className="bg-warning/15 border border-warning/30 p-4 rounded-xl text-warning text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <Clock size={16} />
                  <span>Instructions Pending Approval</span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Return instructions become available after the owner approves your booking and the rental becomes active.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowReturnModal(false)}
              className="w-full bg-primary text-text-primary font-semibold py-3 rounded-xl hover:bg-primary-hover transition-all cursor-pointer text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
