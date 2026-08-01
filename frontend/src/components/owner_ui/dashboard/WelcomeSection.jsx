const WelcomeSection = ({ user }) => {
  return (
    <div className="mb-10">
      <h2 className="text-4xl font-black tracking-tight ">
        Welcome back, {user?.name || "Owner"}
      </h2>

      <p className="text-text-secondary text-lg">
        Here's how your listed items are performing today
      </p>
    </div>
  );
};

export default WelcomeSection;