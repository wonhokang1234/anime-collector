import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden px-4"
      style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
    >
      <span className="ambient-lantern" aria-hidden />
      <AuthForm mode="signup" />
    </div>
  );
}
