export default function DashboardHeader({ userName }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold tracking-tight text-text-primary">
        Welcome back, {userName || "User"}
      </h2>
      <p className="text-text-secondary text-sm mt-1">
        Here is what's happening with your rentals today.
      </p>
    </div>
  );
}
