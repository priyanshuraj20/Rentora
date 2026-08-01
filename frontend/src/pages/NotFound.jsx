import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-app flex items-center justify-center relative overflow-hidden">

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* Ambient floating particles */}
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-bright/20"
                    style={{
                        width: `${8 + i * 6}px`,
                        height: `${8 + i * 6}px`,
                        left: `${10 + i * 15}%`,
                        top: `${15 + (i % 3) * 25}%`,
                        animation: `float ${3 + i * 0.8}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`,
                    }}
                />
            ))}

            {/* Large background glow */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full bg-bright/5 blur-3xl"
                style={{ animation: "pulse-ring 4s ease-in-out infinite" }}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-xl">

                {/* 404 Number */}
                <div
                    className="mb-6"
                    style={{ animation: "fade-up 0.6s ease-out" }}
                >
                    <h1
                        className="text-[160px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text select-none bg-bright"
                        
                    >
                        404
                    </h1>
                </div>

                {/* Divider line */}
                <div
                    className="w-20 h-1 bg-gradient-to-r from-transparent via-bright to-transparent mx-auto mb-8 rounded-full"
                    style={{ animation: "fade-up 0.6s ease-out 0.15s both" }}
                />

                {/* Message */}
                <div style={{ animation: "fade-up 0.6s ease-out 0.3s both" }}>
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 tracking-tight">
                        Page not found
                    </h2>
                    <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>
                </div>

                {/* Action Buttons */}
                <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
                    style={{ animation: "fade-up 0.6s ease-out 0.5s both" }}
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-surface border border-divider text-text-secondary hover:text-text-primary hover:border-bright/40 hover:bg-elevated transition-all text-sm font-bold w-full sm:w-auto justify-center"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-bright text-app hover:bg-bright/85 active:scale-[0.98] transition-all text-sm font-bold w-full sm:w-auto justify-center shadow-lg shadow-bright/20"
                    >
                        <Home size={16} />
                        Back to Home
                    </button>

                    <button
                        onClick={() => navigate("/explore")}
                        className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-surface border border-divider text-text-secondary hover:text-text-primary hover:border-bright/40 hover:bg-elevated transition-all text-sm font-bold w-full sm:w-auto justify-center"
                    >
                        <Search size={16} className="group-hover:scale-110 transition-transform" />
                        Explore
                    </button>
                </div>

                {/* Subtle footer hint */}
                <p
                    className="text-text-muted text-xs mt-12 tracking-wide"
                    style={{ animation: "fade-up 0.6s ease-out 0.7s both" }}
                >
                    Error 404 &middot; RentItRight
                </p>
            </div>
        </div>
    );
};
