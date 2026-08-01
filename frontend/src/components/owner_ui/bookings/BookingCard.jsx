import { Calendar, User, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';

const BookingCard = ({ booking, onApprove, onReject, onComplete, onExtend, activeTab }) => {
  const { item, status, id, startDate, endDate, renterInfo } = booking;
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endStr) => {
    const today = new Date();
    const end = new Date(endStr);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    let bgColor = 'bg-yellow-500/10 text-yellow-500';
    if (statusLower === 'approved') bgColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    if (statusLower === 'confirmed' || statusLower === 'ongoing' || statusLower === 'completed') bgColor = 'bg-green-500/10 text-green-500';
    if (statusLower === 'rejected' || statusLower === 'cancelled') bgColor = 'bg-red-500/10 text-red-500';
    
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${bgColor}`}>
        {statusLower === 'approved' ? 'Approved (Awaiting Payment)' : status}
      </span>
    );
  };

  const daysRemaining = getDaysRemaining(endDate);

  return (
    <div className="bg-card border border-divider/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 hover:border-divider/50 transition-all">
      {/* Item Image */}
      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
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
        <h3 className="text-xl font-bold text-text-primary tracking-tight">
          {item?.title || 'Unknown Item'}
        </h3>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <span className="font-medium">Renter: <span className="text-text-primary">{renterInfo?.name || 'Unknown Renter'}</span></span>
          </div>
          
          {activeTab === 'active' ? (
            <div className="space-y-1 mt-1">
              <div className="text-sm font-medium text-text-primary">
                Ends on: {formatDate(endDate)}
              </div>
              <div className={`text-xs font-bold ${daysRemaining <= 1 ? 'text-error' : 'text-bright'}`}>
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
              <Calendar size={14} className="text-bright" />
              <span>Dates: <span className="text-text-primary font-medium">{formatDate(startDate)} - {formatDate(endDate)}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex md:flex-col gap-3 w-full md:w-auto">
        {status?.toLowerCase() === 'pending' && (
          <>
            <button 
              onClick={() => onApprove(id)}
              className="flex-1 md:w-40 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle size={16} />
              Approve Request
            </button>
            <button 
              onClick={() => onReject(id)}
              className="flex-1 md:w-40 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer"
            >
              <XCircle size={16} />
              Reject
            </button>
          </>
        )}

        {status?.toLowerCase() === 'approved' && (
          <div className="text-amber-400 flex items-center gap-1.5 font-bold text-xs bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
            <Clock size={16} /> Awaiting Renter Payment
          </div>
        )}

        {activeTab === 'active' && (status?.toLowerCase() === 'confirmed' || status?.toLowerCase() === 'ongoing') && (
          <>
            <button 
              onClick={() => onComplete(id)}
              className="flex-1 md:w-44 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <CheckCircle size={16} />
              Mark as Returned
            </button>
            <button 
              onClick={() => onExtend(id)}
              className="flex-1 md:w-44 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-sm transition-all border border-divider/30 active:scale-95 cursor-pointer"
            >
              <RotateCcw size={16} />
              Extend Rental
            </button>
          </>
        )}

        {activeTab !== 'active' && (status?.toLowerCase() === 'confirmed' || status?.toLowerCase() === 'ongoing') && (
           <div className="text-green-500 flex items-center gap-1 font-bold text-sm px-4">
              <CheckCircle size={16} /> Confirmed
           </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
