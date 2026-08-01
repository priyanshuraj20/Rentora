export default function ImageGallery({ images }) {
  const displayImage = images && images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200";

  return (
    <div className="space-y-5">
      <div className="relative aspect-[16/9] rounded-[32px] overflow-hidden bg-surface border border-white/5 shadow-2xl">
        <img
          src={displayImage}
          alt="Item visualization"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-app/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="material-symbols-outlined text-primary !text-[18px]">verified_user</span>
          <span className="text-[10px] font-black tracking-[0.2em] text-text-primary uppercase">
            CERTIFIED GEAR
          </span>
        </div>
      </div>
    </div>
  );
}
