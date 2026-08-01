import AuthLayout from "../../components/auth/AuthLayout";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/role-redirect");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="p-8 md:p-12 flex flex-col items-center text-center">

        {/* Success Icon */}
        <div className="mb-8">
          <div className="relative flex items-center justify-center 
                          size-24 bg-bright/10 rounded-full 
                          border-2 border-bright">
            <CheckCircle className="w-14 h-14 text-bright" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary pb-4">
          You&apos;re All Set!
        </h1>

        <p className="text-text-secondary text-lg leading-relaxed mb-10 px-4">
          Your account is ready. You can now start renting or listing items.
        </p>

        {/* CTA */}
        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/renter")}
            className="w-full flex items-center justify-center gap-2 
                       rounded-xl h-14 px-8 bg-bright 
                       text-card text-lg font-extrabold 
                       hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-text-secondary/60 text-sm font-medium">
            You&apos;ll be redirected automatically in{" "}
            <span className="text-bright">{timer} seconds</span>.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Success;
