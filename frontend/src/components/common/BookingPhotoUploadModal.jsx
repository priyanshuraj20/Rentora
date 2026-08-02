import { useState } from "react";
import { toast } from "react-hot-toast";

export default function BookingPhotoUploadModal({ bookingId, type, onSuccess, onClose }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setSelectedFiles(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one photo.");
      return;
    }

    setIsUploading(true);
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      const formData = new FormData();
      formData.append("type", type);
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/photos`, {
        method: "PATCH",
        headers: {
          "X-CSRF-Token": csrfData.csrfToken,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Photos uploaded successfully! 📸");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast.error(data.message || "Failed to upload photos.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error uploading photos.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-divider rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-primary capitalize">
            Upload {type} Evidence Photos
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Select Photos (Max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-xs text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-text-primary hover:file:bg-primary-hover cursor-pointer"
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-divider">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-divider">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-xl border border-divider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="px-4 py-2 text-xs font-semibold bg-primary text-text-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl"
            >
              {isUploading ? "Uploading..." : "Upload Photos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
