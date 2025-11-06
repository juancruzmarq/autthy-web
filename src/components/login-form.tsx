import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Label } from "@radix-ui/react-label";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        setErr(error.response?.data.message || "Login failed");
      } else {
        setErr("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  function onGoogle() {
    // opcional: recordar a dónde volver
    const from =
      new URLSearchParams(window.location.search).get("from") ||
      (history.state &&
        history.state.usr &&
        history.state.usr.from?.pathname) ||
      "/";
    sessionStorage.setItem("postLoginFrom", from);

    // redirigir a tu backend
    window.location.href = `${API}/auth/google`;
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <FieldGroup className="gap-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-red-900">Autthy</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
                </p>
              </div>
              {err && <Label className="text-red-600 text-center">{err}</Label>}
              <Field>
                <FieldLabel htmlFor="email" className="text-red-900">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-red-900">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="bg-red-900 text-white hover:bg-red-800 w-full"
                  onClick={onSubmit}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="justify-center align-middle gap-4 md:gap-0 w-full">
                <Button
                  variant="outline"
                  type="button"
                  className=" text-red-900 hover:bg-red-100 w-1/2 md:w-full"
                  onClick={onGoogle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-red-900">
                  Sign up
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden md:block">
            <img
              src="/autthy.png"
              alt="Image"
              className="absolute inset-0  w-lg m-auto object-contain"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
