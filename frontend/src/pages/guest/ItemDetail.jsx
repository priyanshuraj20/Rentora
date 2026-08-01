import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ImageGallery from "../../components/guest_ui/item_detail/ImageGallery";
import ItemHeader from "../../components/guest_ui/item_detail/ItemHeader";
import ItemSpecs from "../../components/guest_ui/item_detail/ItemSpecs";
import AvailabilityCalendar from "../../components/guest_ui/item_detail/AvailabilityCalendar";

export default function ItemDetail() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/explore/${id}`);
                const data = await res.json();
                if (data.status === "success") {
                    setItem(data.item);
                }
            } catch (err) {
                console.error("Failed to fetch item:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-text-secondary">Loading item details...</div>;
    if (!item) return <div className="min-h-screen flex items-center justify-center text-error">Item not found</div>;

    return (
        <main className="max-w-6xl mx-auto px-6 py-10">
            {/* Breadcrumb */}
            <nav className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                <span>Marketplace</span>
                <span className="material-symbols-outlined !text-sm mt-0.5">chevron_right</span>
                <span>{item.category}</span>
                <span className="material-symbols-outlined !text-sm mt-0.5">chevron_right</span>
                <span className="text-text-primary">{item.title}</span>
            </nav>

            <div className="grid grid-cols-12 gap-8 lg:gap-10">
                {/* LEFT */}
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    <ImageGallery images={item.images} />
                    <ItemHeader item={item} />

                    <section className="space-y-6 max-w-3xl">
                        <h3 className="text-2xl font-black text-text-primary tracking-tight">The Full Picture</h3>
                        <div className="text-text-secondary leading-relaxed font-medium text-lg">
                            <p>{item.description}</p>
                        </div>
                    </section>

                    {/* Specifications only if they exist in a future schema, for now removing hardcoded one */}
                    {/* <ItemSpecs /> */}
                </div>

                {/* RIGHT */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <AvailabilityCalendar unavailableDates={item.unavailableDates} />
                </div>
            </div>
        </main>
    );
}
