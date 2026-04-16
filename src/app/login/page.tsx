import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <span className="ambient-lantern" aria-hidden />
      <AuthForm mode="login" />
    </div>
  );
}
