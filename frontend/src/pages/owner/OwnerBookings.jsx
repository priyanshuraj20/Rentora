import React, { useState, useEffect, useMemo } from 'react';
import BookingTabs from '../../components/owner_ui/bookings/BookingTabs';
import BookingCard from '../../components/owner_ui/bookings/BookingCard';
import BookingPhotoUploadModal from '../../components/common/BookingPhotoUploadModal';
import QRDisplayModal from '../../components/common/QRDisplayModal';
import QRScannerModal from '../../components/common/QRScannerModal';
import toast from 'react-hot-toast';

const OwnerBookings = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [photoModalBookingId, setPhotoModalBookingId] = useState(null);
  const [qrDisplayModal, setQrDisplayModal] = useState({ open: false, bookingId: null });
  const [qrScannerModal, setQrScannerModal] = useState({ open: false, bookingId: null });

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include"
      });
      const csrfData = await csrf.json();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken
        },
        credentials: "include"
      });
      
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include"
      });
      const csrfData = await csrf.json();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken
        },
        credentials: "include"
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Failed to approve booking:", error);
    }
  };

  const handleReject = async (id) => {
    const message = prompt("Please enter a reason for rejection (min 10 chars):");
    if (!message || message.length < 10) {
       toast.error("Rejection message must be at least 10 characters.");
       return;
    }

    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include"
      });
      const csrfData = await csrf.json();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken
        },
        body: JSON.stringify({ rejectMessage: message }),
        credentials: "include"
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Failed to reject booking:", error);
    }
  };

  const executeComplete = async (id) => {
    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include"
      });
      const csrfData = await csrf.json();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken
        },
        credentials: "include"
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Booking completed! 🎉");
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to mark booking as completed.");
      }
    } catch (error) {
      console.error("Failed to complete booking:", error);
    }
  };

  const handleComplete = (id) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking && (!booking.returnPhotos || booking.returnPhotos.length === 0)) {
      setPhotoModalBookingId(id);
    } else {
      if (window.confirm("Are you sure the item has been returned?")) {
        executeComplete(id);
      }
    }
  };

  const handleExtend = (id) => {
    toast("Extend Rental functionality coming soon!", { icon: "⏳" });
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = booking.status?.toLowerCase();
      switch (activeTab) {
        case 'pending':
          return status === 'pending';
        case 'active':
          return status === 'approved' || status === 'confirmed' || status === 'ongoing';
        case 'upcoming':
          return (status === 'approved' || status === 'confirmed') && new Date(booking.startDate) > new Date();
        case 'history':
          return status === 'rejected' || status === 'cancelled' || status === 'completed' || new Date(booking.endDate) < new Date();
        default:
          return true;
      }
    });
  }, [bookings, activeTab]);

  return (
    <main className="min-h-screen bg-app">
      <div className="max-w-[1400px] px-6 py-6 mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black tracking-tighter text-white">Bookings</h1>
            <p className="text-text-secondary font-medium text-lg">Manage rental requests and active bookings</p>
        </div>

        {/* Tabs and Content */}
        <div className="mt-8">
          <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-white text-center py-10 font-medium">Loading bookings...</div>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onApprove={handleApprove} 
                  onReject={handleReject} 
                  onComplete={handleComplete}
                  onExtend={handleExtend}
                  onShowHandoverQR={(id) => setQrDisplayModal({ open: true, bookingId: id })}
                  onScanReturnQR={(id) => setQrScannerModal({ open: true, bookingId: id })}
                  activeTab={activeTab}
                />
              ))
            ) : (
              <div className="text-text-secondary text-center py-20 bg-surface border border-divider/10 rounded-2xl">
                <p className="text-xl font-medium text-white">No bookings found for "{activeTab}"</p>
                <p className="text-sm">When you receive requests, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {photoModalBookingId && (
        <BookingPhotoUploadModal
          bookingId={photoModalBookingId}
          type="return"
          onClose={() => setPhotoModalBookingId(null)}
          onSuccess={() => {
            const idToComplete = photoModalBookingId;
            setPhotoModalBookingId(null);
            executeComplete(idToComplete);
          }}
        />
      )}

      {qrDisplayModal.open && (
        <QRDisplayModal
          bookingId={qrDisplayModal.bookingId}
          type="handover"
          onClose={() => setQrDisplayModal({ open: false, bookingId: null })}
        />
      )}

      {qrScannerModal.open && (
        <QRScannerModal
          bookingId={qrScannerModal.bookingId}
          onClose={() => setQrScannerModal({ open: false, bookingId: null })}
          onSuccess={fetchBookings}
        />
      )}
    </main>
  );
};

export default OwnerBookings;
