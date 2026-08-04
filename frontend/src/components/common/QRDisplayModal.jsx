import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-hot-toast";

export default function QRDisplayModal({ bookingId, type, onClose }) {
  const [token, setToken] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchQR = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/qr-code?type=${type}`,
        { method: "GET", credentials: "include" },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.data.token);
        setSecondsLeft(data.data.expiresIn);
      } else {
        toast.error(data.message || "Failed to generate QR code.");
      }
    } catch {
      toast.error("Network error generating QR code.");
    } finally {
      setLoading(false);
    }
  }, [bookingId, type]);

  useEffect(() => {
    fetchQR();
  }, [fetchQR]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const expired = !loading && secondsLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-surface border border-divider rounded-2xl p-6 shadow-2xl text-center">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-primary capitalize">
            {type} QR Code
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl font-bold">
            ✕
          </button>
        </div>

        <p className="text-xs text-text-secondary mb-4">
          Ask the {type === "handover" ? "renter" : "owner"} to scan this with
          their camera to confirm.
        </p>

        <div className="bg-white p-4 rounded-xl inline-block mx-auto">
          {loading ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center text-sm text-black/50">
              Generating...
            </div>
          ) : expired ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center text-sm text-red-600 font-semibold">
              Expired
            </div>
          ) : (
            <QRCodeSVG value={token} size={200} />
          )}
        </div>

        <p className="text-xs text-text-muted mt-3">
          {expired ? "This code has expired." : `Expires in ${secondsLeft}s`}
        </p>

        {expired && (
          <button
            onClick={fetchQR}
            className="mt-3 px-4 py-2 text-xs font-semibold bg-primary text-text-primary hover:bg-primary-hover rounded-xl"
          >
            Generate New Code
          </button>
        )}
      </div>
    </div>
  );
}
