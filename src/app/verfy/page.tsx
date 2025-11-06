import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function VerifyPage() {
  const [msg, setMsg] = useState("Verificando...");
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    (async () => {
      if (!token) return setMsg("Token inválido.");
      try {
        await api.post("/auth/verify-email", { token });
        setMsg("Email verificado. Ya podés iniciar sesión.");
      } catch (e: any) {
        setMsg(e?.response?.data?.message ?? "No se pudo verificar.");
      }
    })();
  }, []);
  return <div className="p-8 text-center">{msg}</div>;
}
