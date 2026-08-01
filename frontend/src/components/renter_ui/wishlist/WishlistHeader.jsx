export default function WishlistHeader({ title, subtitle, total }) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight">
          {title} <span className="text-muted">({total})</span>
        </h1>
        <p className="text-muted mt-1 text-text-secondary">{subtitle}</p>
      </div>

    </div>
  );
}
