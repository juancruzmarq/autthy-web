import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function GoogleCallbackPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);

    // 1) ¿vino access en query o fragment?
    const accessFromQuery = url.searchParams.get("access");
    const accessFromHash = new URLSearchParams(url.hash.slice(1)).get("access");
    const access = accessFromQuery || accessFromHash;

    // 2) a dónde volver
    const from = sessionStorage.getItem("postLoginFrom") || "/";

    (async () => {
      try {
        if (access) {
          // Si tu backend mandó access por URL, guardalo y listo
          sessionStorage.setItem("access", access);
          // attachToken(access) se hará al recargar el provider, o podés importarlo y llamarlo acá
          window.history.replaceState(null, "", "/"); // limpiar la URL
          navigate(from, { replace: true });
          return;
        }

        // 3) Si no vino access, usamos la cookie httpOnly de refresh
        await refresh();
        navigate(from, { replace: true });
      } catch {
        // si falla, a login
        navigate("/login", { replace: true });
      } finally {
        sessionStorage.removeItem("postLoginFrom");
      }
    })();
  }, [navigate, refresh]);

  return <div className="p-8 text-center">Procesando acceso…</div>;
}
