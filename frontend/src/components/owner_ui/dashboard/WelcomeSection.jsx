const WelcomeSection = ({ user }) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold tracking-tight text-text-primary">
        Welcome back, {user?.name || "Owner"}
      </h2>

      <p className="text-text-secondary text-sm mt-1">
        Here's how your listed items are performing today
      </p>
    </div>
  );
};

export default WelcomeSection;