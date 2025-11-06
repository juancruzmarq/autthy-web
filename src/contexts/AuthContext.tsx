import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AxiosError } from "axios";
import { api, attachToken } from "@/lib/api";

type User = {
  id_user: string;
  email: string;
  name?: string | null;
  surname?: string | null;
  display_name?: string | null;
  photo_url?: string | null;
  phone_number?: string | null;
  email_verified?: boolean | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
type LoginResp = { access_token: string; user: User };
type AuthStatus = "unknown" | "checking" | "authenticated" | "unauthenticated";

type Ctx = {
  user: User | null;
  access: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  ensureAuth: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("unknown");

  // single-flight lock para refresh
  const inflight = useRef<Promise<void> | null>(null);

  // Cargar access guardado
  useEffect(() => {
    const saved = sessionStorage.getItem("access");
    if (saved) {
      setAccess(saved);
      attachToken(saved);
      setStatus("authenticated");
    } else {
      setStatus("unknown");
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get<User>("/me");
      setUser(data);
    } catch (e) {
      console.error("Error fetching user:", e);
      setUser(null);
    }
  };

  const refresh = async () => {
    if (inflight.current) return inflight.current;
    setStatus((s) => (s === "authenticated" ? s : "checking"));
    inflight.current = (async () => {
      try {
        // Evitar recursión: jamás refrescar cuando ya estamos llamando a /auth/refresh
        const { data } = await api.post<{ access_token: string }>(
          "/auth/refresh"
        );
        setAccess(data.access_token);
        attachToken(data.access_token);
        sessionStorage.setItem("access", data.access_token);
        setStatus("authenticated");
        await fetchUser(); // asegurarse de tener el user actualizado
      } catch (e) {
        setUser(null);
        setAccess(null);
        attachToken(undefined);
        sessionStorage.removeItem("access");
        setStatus("unauthenticated");
        throw e;
      } finally {
        inflight.current = null;
      }
    })();
    return inflight.current;
  };

  const ensureAuth = async () => {
    // Sólo intenta si no tenemos access ni sabemos el estado
    if (status === "unknown") {
      await refresh().catch(() => {});
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<LoginResp>("/auth/login", {
      email,
      password,
    });
    setUser(data.user);
    setAccess(data.access_token);
    attachToken(data.access_token);
    sessionStorage.setItem("access", data.access_token);
    setStatus("authenticated");
    await fetchUser(); // asegurarse de tener el user actualizado
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.warn("Logout request failed, clearing local auth state anyway.");
    }
    setUser(null);
    setAccess(null);
    attachToken(undefined);
    sessionStorage.removeItem("access");
    setStatus("unauthenticated");
  };

  // Interceptor 401 -> refresh -> retry (una sola vez)
  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      async (error: AxiosError) => {
        const original = error.config;
        const statusCode = error.response?.status;
        const url = original?.url ?? "";

        // No intentes refresh si: sin config, no es 401, ya reintentamos, o es un endpoint de auth
        if (
          !original ||
          statusCode !== 401 ||
          (original as any)._retry ||
          url.startsWith("/auth/login") ||
          url.startsWith("/auth/refresh")
        ) {
          return Promise.reject(error);
        }

        (original as any)._retry = true;
        try {
          await refresh();
          return api(original);
        } catch {
          return Promise.reject(error);
        }
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []); // no dependas de refresh para que no se reinstale el interceptor

  const value = useMemo(
    () => ({ user, access, status, login, logout, refresh, ensureAuth }),
    [user, access, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
