import { Calendar, User, CheckCircle, XCircle, Clock, RotateCcw, KeyRound, ShieldCheck, Camera } from 'lucide-react';

const BookingCard = ({ booking, onApprove, onReject, onComplete, onExtend, onVerifyHandoverPin, onShowReturnPin, onShowHandoverPin, onEnterReturnPin, onUploadPhotos, activeTab }) => {
  const { item, status, id, startDate, endDate, renterInfo } = booking;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const getDaysRemaining = (endStr) => {
    if (!endStr) return 0;
    try {
      const today = new Date();
      const end = new Date(endStr);
      if (isNaN(end.getTime())) return 0;
      const diffTime = end - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    let bgColor = 'bg-warning/15 text-warning border border-warning/30';
    if (statusLower === 'approved') bgColor = 'bg-secondary-accent/15 text-secondary-accent border border-secondary-accent/30';
    if (statusLower === 'confirmed' || statusLower === 'ongoing' || statusLower === 'completed') bgColor = 'bg-success/15 text-success border border-success/30';
    if (statusLower === 'rejected' || statusLower === 'cancelled') bgColor = 'bg-error/15 text-error border border-error/30';
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${bgColor}`}>
        {statusLower === 'approved' ? 'Approved (Awaiting Payment)' : status}
      </span>
    );
  };

  const daysRemaining = getDaysRemaining(endDate);

  return (
    <div className="bg-surface border border-divider rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-primary/40 transition-all duration-300 shadow-sm">
      {/* Item Image */}
      <div className="w-full md:w-44 h-28 rounded-2xl overflow-hidden bg-card border border-divider flex-shrink-0">
        <img 
          src={item?.image || 'https://via.placeholder.com/200x120?text=No+Image'} 
          alt={item?.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Booking Info */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          {getStatusBadge(status)}
        </div>
        <h3 className="text-lg font-bold text-text-primary tracking-tight">
          {item?.title || 'Unknown Item'}
        </h3>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs flex-wrap">
            <span className="font-medium">Renter: <span className="text-text-primary">{renterInfo?.name || 'Unknown Renter'}</span></span>
          </div>

          <div className="flex items-center gap-4 text-xs text-text-muted pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
            </div>
            
            {activeTab === 'active' && daysRemaining >= 0 && (
              <div className="flex items-center gap-1 text-secondary-accent">
                <Clock className="w-3.5 h-3.5" />
                <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left</span>
              </div>
            )}
          </div>

          {/* Condition Photos Previews */}
          {((booking.handoverPhotos && booking.handoverPhotos.length > 0) || (booking.returnPhotos && booking.returnPhotos.length > 0)) && (
            <div className="flex gap-4 pt-2 border-t border-divider/50 mt-2">
              {booking.handoverPhotos && booking.handoverPhotos.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-secondary font-medium">Pickup Photos:</span>
                  <div className="flex gap-1">
                    {booking.handoverPhotos.map((photo, idx) => (
                      <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="size-8 rounded-lg overflow-hidden border border-divider">
                        <img src={photo.url} alt={`Handover ${idx}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {booking.returnPhotos && booking.returnPhotos.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-secondary font-medium">Return Photos:</span>
                  <div className="flex gap-1">
                    {booking.returnPhotos.map((photo, idx) => (
                      <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="size-8 rounded-lg overflow-hidden border border-divider">
                        <img src={photo.url} alt={`Return ${idx}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex md:flex-col gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-divider">
        {activeTab === 'pending' && (
          <>
            <button
              onClick={() => onApprove(id)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-text-primary px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => onReject(id)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-card hover:bg-error/15 text-error border border-error/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </>
        )}

        {activeTab === 'active' && (() => {
          const statusLower = status?.toLowerCase();
          const isHandoverDone = Boolean(booking.handoverConfirmedAt) || statusLower === 'ongoing' || statusLower === 'completed';
          const isReturnDone = Boolean(booking.returnConfirmedAt) || statusLower === 'completed';

          if (statusLower === 'approved') {
            return (
              <div className="px-4 py-2.5 rounded-xl bg-secondary-accent/10 border border-secondary-accent/30 text-secondary-accent text-xs font-semibold text-center">
                Awaiting Renter Payment
              </div>
            );
          }

          const hasHandoverPhotos = booking.handoverPhotos && booking.handoverPhotos.length > 0;
          const hasReturnPhotos = booking.returnPhotos && booking.returnPhotos.length > 0;

          return (
            <>
              {statusLower === 'confirmed' && !isHandoverDone && (
                hasHandoverPhotos ? (
                  <button
                    onClick={() => (onVerifyHandoverPin || onShowHandoverPin) && (onVerifyHandoverPin || onShowHandoverPin)(id)}
                    className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-primary/20 active:scale-95"
                    title="Renter will tell you their 15-second dynamic PIN at physical pickup"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Renter PIN & Handover</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => onUploadPhotos?.(id, 'handover')}
                      className="w-full flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Pickup Photos</span>
                    </button>
                    <p className="text-[10px] text-text-muted text-center">
                      Pickup photos required before PIN handover
                    </p>
                  </div>
                )
              )}
              {isHandoverDone && !isReturnDone && (
                hasReturnPhotos ? (
                  <>
                    <button
                      onClick={() => (onShowReturnPin || onEnterReturnPin) && (onShowReturnPin || onEnterReturnPin)(id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                      title="Share this 15-second dynamic PIN with renter after verifying gear condition"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Show Return PIN to Renter</span>
                    </button>
                    <button
                      onClick={() => onComplete(id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-success/20 hover:bg-success/30 text-success border border-success/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Returned</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => onUploadPhotos?.(id, 'return')}
                      className="w-full flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Return Photos</span>
                    </button>
                    <p className="text-[10px] text-text-muted text-center">
                      Return photos required before Return PIN
                    </p>
                  </div>
                )
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default BookingCard;
