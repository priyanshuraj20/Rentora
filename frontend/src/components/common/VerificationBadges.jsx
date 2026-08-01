import { useState } from "react";
import { ShieldCheck, Mail, Phone, IdCard, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import PhoneVerificationModal from "./PhoneVerificationModal";

export default function VerificationBadges({ badges, onRefresh }) {
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const emailVerified = badges?.isEmailVerified ?? false;
  const phoneVerified = badges?.isPhoneVerified ?? false;
  const identityVerified = badges?.isIdentityVerified ?? false;

  return (
    <div className="bg-surface border border-divider rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-divider">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Trust & Verification Status
          </h3>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Email Badge */}
        <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
          emailVerified 
            ? "bg-success/5 border-success/30 text-text-primary" 
            : "bg-card border-divider text-text-muted"
        }`}>
          <Mail className={`size-4 ${emailVerified ? "text-success" : "text-text-muted"}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold flex items-center gap-1">
              <span>Email</span>
              {emailVerified ? (
                <CheckCircle2 className="size-3.5 text-success" />
              ) : (
                <XCircle className="size-3.5 text-text-muted" />
              )}
            </div>
            <span className="text-[10px] text-text-muted block truncate">
              {emailVerified ? "Email Verified" : "Not Verified"}
            </span>
          </div>
        </div>

        {/* Phone Badge */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
          phoneVerified 
            ? "bg-success/5 border-success/30 text-text-primary" 
            : "bg-primary/5 border-primary/30 text-text-primary"
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <Phone className={`size-4 ${phoneVerified ? "text-success" : "text-primary"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold flex items-center gap-1">
                <span>Phone</span>
                {phoneVerified ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <XCircle className="size-3.5 text-primary" />
                )}
              </div>
              <span className="text-[10px] text-text-muted block truncate">
                {phoneVerified ? "SMS Verified" : "Verification Required"}
              </span>
            </div>
          </div>
          {!phoneVerified && (
            <button
              onClick={() => setShowPhoneModal(true)}
              className="bg-primary text-text-primary text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              Verify <ArrowRight className="size-3" />
            </button>
          )}
        </div>

        {/* Identity Badge */}
        <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
          identityVerified 
            ? "bg-success/5 border-success/30 text-text-primary" 
            : "bg-card border-divider text-text-muted"
        }`}>
          <IdCard className={`size-4 ${identityVerified ? "text-success" : "text-text-muted"}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold flex items-center gap-1">
              <span>Identity (Govt ID)</span>
              {identityVerified ? (
                <CheckCircle2 className="size-3.5 text-success" />
              ) : (
                <XCircle className="size-3.5 text-text-muted" />
              )}
            </div>
            <span className="text-[10px] text-text-muted block truncate">
              {identityVerified ? "Govt ID Verified" : "Not Verified"}
            </span>
          </div>
        </div>

      </div>

      {showPhoneModal && (
        <PhoneVerificationModal
          onClose={() => setShowPhoneModal(false)}
          onSuccess={() => {
            setShowPhoneModal(false);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
