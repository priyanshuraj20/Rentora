import { useNavigate } from "react-router-dom";

export default function OwnerInfo({ owner, bookingId }) {
  const navigate = useNavigate();

  const handleChat = () => {
    navigate("/messages", { state: { bookingId } });
  };

  return (
    <div className="bg-surface border-1 border-app/80 rounded-2xl p-6">
      <h3 className="text-sm font-bold uppercase mb-6">Owner Information</h3>

      <div className="flex items-center gap-4 mb-6">
        <img src={owner?.avatar} className="size-14 rounded-full object-cover" alt={owner?.name} />
        <div>
          <p className="font-bold">{owner?.name}</p>
          <p className="text-sm text-text-secondary">
            ⭐ {owner?.rating || "4.8"} ({owner?.reviews || "42"} reviews)
          </p>
        </div>
      </div>

      <button
        onClick={handleChat}
        className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-hover transition-all cursor-pointer"
      >
        Chat with Owner
      </button>
    </div>
  );
}
