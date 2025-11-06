import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export default function LoginPage() {
  const { status, ensureAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (status === "unknown") void ensureAuth();
    if (status === "authenticated") navigate(from, { replace: true });
  }, [status, ensureAuth, navigate, from]);

  if (status === "unknown" || status === "checking") return null; // spinner opcional
  if (status === "authenticated") return null; // ya redirige

  return (
    <div className="bg-red-900 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
