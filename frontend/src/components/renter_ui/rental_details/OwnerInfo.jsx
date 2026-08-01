import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export default function OwnerInfo({ owner, bookingId }) {
  const navigate = useNavigate();

  const handleChat = () => {
    navigate("/messages", { state: { bookingId } });
  };

  return (
    <div className="bg-surface border border-divider rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-5 text-text-muted">Owner Information</h3>

      <div className="flex items-center gap-4 mb-6">
        <img src={owner?.avatar} className="size-12 rounded-full object-cover border border-divider" alt={owner?.name} />
        <div>
          <p className="font-bold text-sm text-text-primary">{owner?.name}</p>
          <p className="text-xs text-text-secondary">
            ⭐ {owner?.rating || "4.8"} ({owner?.reviews || "42"} reviews)
          </p>
        </div>
      </div>

      <button
        onClick={handleChat}
        className="w-full bg-primary hover:bg-primary-hover text-text-primary py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
      >
        <MessageSquare size={15} />
        Chat with Owner
      </button>
    </div>
  );
}
