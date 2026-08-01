import { Edit2, Pause, PlayCircle, Trash2, Star } from "lucide-react";

export default function InventoryCard({
    item,
    onEdit,
    onPause,
    onActivate,
    onDelete
}) {
    const isRented = item.status === "rented";

    return (
        <div className="bg-surface border border-divider rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 group cursor-pointer shadow-sm">
            <div className="flex flex-col md:flex-row">
                {/* Left: Info Section */}
                <div className="flex-1 p-4 flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border border-divider bg-card">
                        <img
                            src={item.image && item.image !== "undefined" ? item.image : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-base font-bold text-text-primary tracking-tight">
                                {item.title}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.status === "rented"
                                ? "bg-secondary-accent/15 text-secondary-accent border-secondary-accent/30"
                                : item.status === "paused"
                                ? "bg-warning/15 text-warning border-warning/30"
                                : "bg-primary/15 text-primary border-primary/30"
                                }`}>
                                {item.status}
                            </span>
                            <div className="flex items-center gap-1 ml-auto md:ml-0">
                                <span className="text-xs font-bold text-text-primary">{item.rating}</span>
                                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[10px] font-semibold text-primary uppercase tracking-wider">
                                {item.category}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-bold text-primary">₹{item.price}</span>
                                <span className="text-[10px] text-text-muted font-medium uppercase tracking-tighter">/day</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions Section */}
                <div className="border-t md:border-t-0 md:border-l border-divider flex items-center px-5 py-4 md:py-0 bg-app/30">
                    <div className="flex items-center justify-center gap-4 w-full">
                        <ActionButton
                            icon={<Edit2 size={16} />}
                            label="Edit"
                            onClick={onEdit}
                        />

                        {item.status === "paused" ? (
                            <ActionButton
                                icon={<PlayCircle size={16} />}
                                label="Activate"
                                onClick={onActivate}
                                variant="success"
                            />
                        ) : (
                            <ActionButton
                                icon={<Pause size={16} />}
                                label="Pause"
                                onClick={onPause}
                                variant="warning"
                                disabled={isRented}
                            />
                        )}

                        <ActionButton
                            icon={<Trash2 size={16} />}
                            label="Delete"
                            onClick={onDelete}
                            variant="danger"
                            disabled={isRented}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon, label, onClick, variant = "default", disabled = false }) {
    const variantStyles = {
        default: "hover:text-text-primary hover:bg-white/5 text-text-muted",
        success: "hover:text-success hover:bg-success/10 text-text-muted",
        warning: "hover:text-warning hover:bg-warning/10 text-text-muted",
        danger: "hover:text-error hover:bg-error/10 text-text-muted",
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onClick();
            }}
            disabled={disabled}
            title={disabled ? `Cannot ${label.toLowerCase()} while rented` : label}
            className={`p-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-medium cursor-pointer ${disabled ? "opacity-30 cursor-not-allowed" : variantStyles[variant]
                }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}