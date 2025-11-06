import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./app/login/page";
import RequireAuth from "@/routes/RequireAuth";
import VerifyPage from "./app/verfy/page";
import DashboardPage from "./app/dashboard/page";
import SignupPage from "./app/signup/page";
import GoogleCallbackPage from "./app/google-callback/page";

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/request" element={<ResetRequestPage />} />  */}
      {/* Opcional: si tu backend redirige al front tras Google OAuth */}
      <Route path="/auth/cb" element={<GoogleCallbackPage />} />

      {/* Privadas */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
