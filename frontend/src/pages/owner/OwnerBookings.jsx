import React, { useState, useEffect, useMemo } from 'react';
import BookingTabs from '../../components/owner_ui/bookings/BookingTabs';
import BookingCard from '../../components/owner_ui/bookings/BookingCard';
import BookingPhotoUploadModal from '../../components/common/BookingPhotoUploadModal';
import PINDisplayModal from '../../components/common/PINDisplayModal';
import PINInputModal from '../../components/common/PINInputModal';
import toast from 'react-hot-toast';
import { apiClient } from '../../utils/apiClient';
import { useSocket } from '../../context/SocketContext';

const OwnerBookings = () => {
  const { socket } = useSocket() || {};
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [photoModalState, setPhotoModalState] = useState({ open: false, bookingId: null, type: 'return', completeAfter: false });
  const [pinDisplayModal, setPinDisplayModal] = useState({ open: false, bookingId: null, type: 'handover' });
  const [pinInputModal, setPinInputModal] = useState({ open: false, bookingId: null, type: 'return' });

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/booking`, {
        method: "GET",
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

  useEffect(() => {
    if (!socket) return;
    const handleBookingUpdated = () => {
      fetchBookings();
    };
    socket.on("booking_updated", handleBookingUpdated);
    return () => {
      socket.off("booking_updated", handleBookingUpdated);
    };
  }, [socket]);

  const handleApprove = async (id) => {
    try {
      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}/approve`, {
        method: "PATCH",
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Booking approved! Renter notified to complete payment. ✅");
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to approve booking.");
      }
    } catch (error) {
      console.error("Failed to approve booking:", error);
      toast.error(error.message || "Failed to approve booking.");
    }
  };

  const handleReject = async (id) => {
    const message = prompt("Please enter a reason for rejection (min 10 chars):");
    if (!message || message.length < 10) {
       toast.error("Rejection message must be at least 10 characters.");
       return;
    }

    try {
      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejectMessage: message }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Booking request declined.");
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to reject booking.");
      }
    } catch (error) {
      console.error("Failed to reject booking:", error);
      toast.error(error.message || "Failed to reject booking.");
    }
  };

  const executeComplete = async (id) => {
    try {
      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}/complete`, {
        method: "PATCH",
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
      setPhotoModalState({ open: true, bookingId: id, type: 'return', completeAfter: true });
    } else {
      if (window.confirm("Are you sure the item has been returned?")) {
        executeComplete(id);
      }
    }
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
        <div id="owner-bookings-header" className="flex flex-col gap-2">
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
                  key={booking.id || booking._id} 
                  booking={booking} 
                  onApprove={handleApprove} 
                  onReject={handleReject} 
                  onComplete={handleComplete}
                  onUploadPhotos={(id, type) => setPhotoModalState({ open: true, bookingId: id, type, completeAfter: false })}
                  onVerifyHandoverPin={(id) => setPinInputModal({ open: true, bookingId: id, type: 'handover' })}
                  onShowReturnPin={(id) => setPinDisplayModal({ open: true, bookingId: id, type: 'return' })}
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

      {photoModalState.open && (
        <BookingPhotoUploadModal
          bookingId={photoModalState.bookingId}
          type={photoModalState.type}
          onClose={() => setPhotoModalState({ open: false, bookingId: null, type: 'return', completeAfter: false })}
          onSuccess={() => {
            const { bookingId, completeAfter } = photoModalState;
            setPhotoModalState({ open: false, bookingId: null, type: 'return', completeAfter: false });
            if (completeAfter) {
              executeComplete(bookingId);
            } else {
              fetchBookings();
            }
          }}
        />
      )}

      {pinDisplayModal.open && (
        <PINDisplayModal
          bookingId={pinDisplayModal.bookingId}
          type={pinDisplayModal.type}
          open={pinDisplayModal.open}
          onClose={() => setPinDisplayModal({ open: false, bookingId: null, type: 'handover' })}
          onCompleted={fetchBookings}
        />
      )}

      {pinInputModal.open && (
        <PINInputModal
          bookingId={pinInputModal.bookingId}
          type={pinInputModal.type}
          open={pinInputModal.open}
          onClose={() => setPinInputModal({ open: false, bookingId: null, type: 'return' })}
          onSuccess={fetchBookings}
        />
      )}
    </main>
  );
};

export default OwnerBookings;
