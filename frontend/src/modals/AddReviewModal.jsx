import { useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AddReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        credentials: "include",
      });
      const csrfData = await csrf.json();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/reviews/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken,
        },
        body: JSON.stringify({
          bookingId: booking._id || booking.id,
          itemId: booking.item_id?._id || booking.item_id || booking.itemId,
          rating,
          review,
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Thank you! Review submitted successfully.");
        onSuccess?.();
        onClose();
      } else {
        throw new Error(data.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Rate Your Rental Experience</h2>
        <p className="text-xs text-text-secondary mb-6">
          How was your experience renting this item?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Review Comment</label>
            <textarea
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share details of your experience..."
              className="w-full bg-app border border-surface-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-bright"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-bright text-white py-3 rounded-xl font-semibold hover:bg-bright/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
