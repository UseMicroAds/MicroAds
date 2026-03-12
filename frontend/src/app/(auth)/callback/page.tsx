"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const role = searchParams.get("state") || "commenter";

    if (!code) {
      setError("No authorization code received");
      return;
    }

    api
      .googleCallback(code, role)
      .then((data) => {
        login(data.token);
        if (data.user.role === "advertiser") {
          router.push("/campaigns");
        } else {
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        setError(err.message || "Authentication failed");
      });
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Authentication Error
          </h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
