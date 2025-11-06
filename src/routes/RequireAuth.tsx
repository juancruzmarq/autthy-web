import { useAuth } from "@/contexts/AuthContext";
import { useEffect, type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { status, ensureAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (status === "unknown") {
      void ensureAuth();
    }
  }, [status, ensureAuth]);

  // Podés mostrar un loader cuando está verificando
  if (status === "unknown" || status === "checking") {
    return null; // o spinner
  }

  if (status === "authenticated") return children;

  return <Navigate to="/login" replace state={{ from: location }} />;
}
