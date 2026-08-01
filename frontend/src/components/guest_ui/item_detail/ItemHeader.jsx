export default function ItemHeader({ item }) {
  if (!item) return null;
  
  return (
    <section className="border-b border-divider pb-8 mb-4">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight mb-2">
            {item.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
             <span className="flex items-center gap-1 text-warning">
                <span className="material-symbols-outlined !text-sm">star</span>
                {item.rating || "New"}
             </span>
             <span className="opacity-40">·</span>
             <span>{item.location?.city || "Local"}, {item.location?.region || "Area"}</span>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="flex items-baseline gap-1 md:justify-end mb-1">
             <span className="text-3xl font-black text-text-primary">
              ₹{(item.pricing?.daily || item.price?.daily || item.dailyPrice)?.toLocaleString() || "0"}
             </span>
             <span className="text-base text-text-muted font-medium">/day</span>
          </div>
          <div className="flex items-center gap-2 md:justify-end">
             <div className="size-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] uppercase font-black tracking-widest text-primary">
                Instant Booking
             </p>
          </div>
        </div>
      </div>
    </section>
  );
}
