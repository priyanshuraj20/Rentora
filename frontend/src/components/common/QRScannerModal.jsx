import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { toast } from "react-hot-toast";

export default function QRScannerModal({ bookingId, onSuccess, onClose }) {
  const scannerRef = useRef(null);
  const [status, setStatus] = useState("scanning");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader-region",
      {
        fps: 10,
        qrbox: (width, height) => {
          const minEdge = Math.min(width, height);
          const size = Math.floor(minEdge * 0.75);
          return { width: size, height: size };
        },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false,
    );
    scannerRef.current = scanner;

    const handleScanSuccess = async (decodedText) => {
      if (status !== "scanning") return;
      setStatus("locating");
      scanner.pause(true);

      if (!navigator.geolocation) {
        toast.error("Location access is required to confirm this scan.");
        setStatus("scanning");
        scanner.resume();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => confirmScan(decodedText, position.coords.latitude, position.coords.longitude),
        () => {
          toast.error("Please allow location access to confirm the scan.");
          setStatus("scanning");
          scanner.resume();
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    };

    scanner.render(handleScanSuccess, () => {});

    return () => {
      scanner.clear().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmScan = async (token, lat, lng) => {
    setStatus("confirming");
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/confirm-scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ token, scannerLat: lat, scannerLng: lng }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Confirmed successfully! ✅");
        setStatus("done");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(data.message || "Could not confirm scan.");
        setStatus("scanning");
        scannerRef.current?.resume();
      }
    } catch {
      toast.error("Network error confirming scan.");
      setStatus("scanning");
      scannerRef.current?.resume();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-surface border border-divider rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-primary">Scan QR Code</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl font-bold">
            ✕
          </button>
        </div>

        <div id="qr-reader-region" className="rounded-xl overflow-hidden" />

        <p className="text-xs text-text-muted mt-3 text-center">
          {status === "locating" && "Getting your location..."}
          {status === "confirming" && "Confirming..."}
          {status === "scanning" && "Point your camera at the QR code."}
        </p>
      </div>
    </div>
  );
}
