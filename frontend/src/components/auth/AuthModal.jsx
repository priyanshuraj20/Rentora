import { X } from "lucide-react";
import { useEffect } from "react";

export default function AuthModal({ open, onClose, children, maxWidth = "max-w-[440px]", staticModal = false }) {
  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => (document.body.style.overflow = "auto");
  }, [open]);

  // ESC Close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!staticModal && e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, staticModal]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center px-4 py-8">

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />

      {/* Modal Container */}
      <div className={`relative w-full ${maxWidth} bg-surface rounded-2xl border border-divider shadow-2xl z-10 overflow-hidden`}>

        {/* Close Button */}
        <button
          onClick={staticModal ? undefined : onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary z-20 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}
