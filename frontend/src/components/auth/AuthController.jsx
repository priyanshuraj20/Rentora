import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";

import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import VerifyOtp from "../../pages/auth/VerifyOtp";
import Success from "../../pages/auth/Success";
import CompleteProfile from "../../pages/auth/CompleteProfile";

export default function AuthController({
  open,
  isOpen,
  onClose,
  defaultMode = "login",
  initialMode,
  initialRole,
}) {
  const isModalOpen = open !== undefined ? open : isOpen !== undefined ? isOpen : false;
  const activeMode = initialMode || defaultMode;
  const [mode, setMode] = useState(activeMode);
  const [role, setRole] = useState(() => {
    return initialRole || localStorage.getItem("rentora_home_mode") || "owner";
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    setMode(activeMode);
  }, [activeMode]);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    } else {
      const stored = localStorage.getItem("rentora_home_mode");
      if (stored) setRole(stored);
    }
  }, [initialRole, isModalOpen]);

  const switchMode = (next) => setMode(next);

  const screens = {
    login: <Login switchMode={switchMode} onClose={onClose} role={role} setRole={setRole} />,
    register: (
      <Register
        switchMode={switchMode}
        email={email}
        setEmail={setEmail}
        onClose={onClose}
        role={role}
        setRole={setRole}
      />
    ),
    otp: <VerifyOtp switchMode={switchMode} email={email} onClose={onClose} />,
    success: <Success onClose={onClose} />,
    completeProfile: <CompleteProfile switchMode={switchMode} onClose={onClose} />,
  };

  return (
    <AuthModal
      open={isModalOpen}
      onClose={onClose}
      maxWidth={mode === "register" ? "max-w-xl" : mode === "completeProfile" ? "max-w-4xl" : "max-w-[440px]"}
    >
      <div className={role === "renter" ? "renter-theme" : ""}>
        {screens[mode]}
      </div>
    </AuthModal>
  );
}
