"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth-layout";
import {
  AuthCard,
  Divider,
  FieldError,
  FormError,
  GoogleIcon,
} from "@/components/auth-card";

const perks = [
  "AI-powered code reviews on every push",
  "Real-time dashboard with review analytics",
  "Comments posted straight to GitHub",
  "Read-only access to your repos",
];

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const busy = fetchStatus === "fetching";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signUp.password({
      emailAddress: email,
      password,
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || undefined,
    });

    if (result.error) {
      setError(result.error.message || "Something went wrong");
      return;
    }

    await signUp.verifications.sendEmailCode();
    setPendingVerification(true);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signUp.verifications.verifyEmailCode({ code });

    if (result.error) {
      setError(result.error.message || "Invalid code");
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/dashboard");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    const result = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: "/dashboard",
      redirectCallbackUrl: "/sso-callback",
    });

    if (result.error) {
      setError(result.error.message || "Something went wrong");
    }
  };

  return (
    <AuthLayout
      heading="Start reviewing in minutes"
      subheading="Connect your GitHub repos and get AI-powered code reviews on every push."
    >
      {/* Perks - shown on mobile only since left panel is hidden */}
      <div className="lg:hidden mb-6 space-y-2.5">
        {perks.map((perk) => (
          <div key={perk} className="flex items-center gap-2.5">
            <span className="bg-primary/10 text-primary size-5 rounded-full flex items-center justify-center shrink-0">
              <Check className="size-3" />
            </span>
            <span className="text-muted-foreground text-sm">{perk}</span>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Create account</h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          Get started with AI code reviews for free
        </p>
      </div>

      <AuthCard>
        {pendingVerification ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5 text-primary text-sm">
              Verification code sent to <span className="font-medium">{email}</span>
            </div>

            <FormError message={error || errors?.global?.[0]?.message} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Verification code</label>
              <Input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-11 text-center font-mono text-lg tracking-[0.4em]"
                maxLength={6}
                required
              />
              <FieldError message={errors?.fields?.code?.message} />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-lg shadow-primary/25"
              disabled={busy}
            >
              {busy ? "Verifying..." : "Verify email"}
            </Button>
          </form>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium"
              onClick={handleGoogleLogin}
              disabled={busy}
            >
              <GoogleIcon className="mr-2 size-4" />
              Continue with Google
            </Button>

            <Divider />

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormError message={error || errors?.global?.[0]?.message} />

              <div className="space-y-2">
                <label className="text-sm font-medium">Full name</label>
                <Input
                  type="text"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
                <FieldError message={errors?.fields?.emailAddress?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
                <FieldError message={errors?.fields?.password?.message} />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold shadow-lg shadow-primary/25"
                disabled={busy}
              >
                {busy ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </>
        )}
      </AuthCard>

      <p className="text-muted-foreground text-center text-sm mt-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:text-primary/80 font-medium">
          Sign in
        </Link>
      </p>

      {/* Clerk bot protection */}
      <div id="clerk-captcha" />
    </AuthLayout>
  );
}