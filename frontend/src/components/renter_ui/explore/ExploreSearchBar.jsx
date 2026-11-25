import { useState } from "react";
import { Search, Mic, Sparkles } from "lucide-react";
import VoiceBookingAgentModal from "../../common/VoiceBookingAgentModal";

const ExploreSearchBar = ({ value, onChange, onSubmit }) => {
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <>
      <div className="mb-8">
        <form
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto rounded-2xl bg-surface border border-divider flex items-center h-13 px-4 shadow-md focus-within:border-primary/50 transition-all"
        >
          <Search className="text-text-muted mr-3 size-4 shrink-0" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted text-sm font-normal"
            placeholder="Search items near you (e.g. camera, bike, car, drill)..."
          />

          {/* Voice Booking Agent Trigger */}
          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            title="Autonomous Voice Booking (Sarvam Indic AI)"
            className="mr-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
          >
            <Mic size={14} className="animate-pulse text-primary" />
            <span className="hidden sm:inline">Voice Book</span>
          </button>

          <button
            type="submit"
            className="ml-1 bg-primary hover:bg-primary-hover active:scale-95 text-text-primary font-semibold px-5 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0 shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Autonomous Voice-to-Booking Modal */}
      <VoiceBookingAgentModal
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </>
  );
};

export default ExploreSearchBar;
