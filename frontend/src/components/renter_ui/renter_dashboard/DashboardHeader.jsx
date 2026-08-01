export default function DashboardHeader({ userName }) {
  return (
    <div className="mb-10">
      <h2 className="text-4xl font-black tracking-tight">
        Welcome back, {userName}
      </h2>
      <p className="text-text-secondary text-lg">
        Here is what's happening with your rentals today.
      </p>
    </div>
  );
}
