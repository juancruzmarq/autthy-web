import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Hola {user?.name ?? user?.email}</p>
      <button
        className="px-3 py-2 rounded bg-slate-900 text-white"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
