"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const busy = fetchStatus === "fetching";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn.password({ emailAddress: email, password });

    if (result.error) {
      setError(result.error.message || "Something went wrong");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
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

    const result = await signIn.sso({
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
      heading="Welcome back"
      subheading="Sign in to your dashboard and see AI-powered reviews for your code."
      stats={[
        { value: "17K+", label: "Customers" },
        { value: "6M+", label: "Repos" },
        { value: "200M+", label: "Reviews" },
      ]}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          Enter your credentials to access your account
        </p>
      </div>

      <AuthCard>
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
            <label className="text-sm font-medium">Email address</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
            <FieldError message={errors?.fields?.identifier?.message} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
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
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </AuthCard>

      <p className="text-muted-foreground text-center text-sm mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary hover:text-primary/80 font-medium">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}