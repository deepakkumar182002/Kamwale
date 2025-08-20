"use client";

// import { calSans } from "@/app/fonts";
import { signIn } from "next-auth/react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { calSans } from "@/app/fonts";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  return (
    <div className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${calSans.className} mb-3 text-2xl dark:text-black`}>
          Please log in to continue.
        </h1>

        <LoginButton />
      </div>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="mt-4 w-full"
      variant={"secondary"}
      aria-disabled={pending}
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Log in with Google
    </Button>
  );
}

// Manual login form
export function ManualLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    } as any);

    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Username or Email"
        className="w-full rounded border px-3 py-2"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
        className="w-full rounded border px-3 py-2"
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>

      <div className="flex justify-between text-sm mt-2">
        <a href="/auth/forgot-password" className="text-blue-600">
          Forgot Password?
        </a>
        <a href="/auth/register" className="text-blue-600">
          Not registered? Register now
        </a>
      </div>
    </form>
  );
}
