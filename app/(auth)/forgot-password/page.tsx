"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // placeholder: no email sending for now
    setSuccess("If that email exists, we've sent a password reset link (simulated).");
  }

  return (
    <div className="max-w-md mx-auto mt-24">
      <h1 className="text-2xl mb-4">Forgot password</h1>
      {success && <p className="text-green-600">{success}</p>}
      <form onSubmit={submit} className="space-y-3 mt-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
        />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
    </div>
  );
}
