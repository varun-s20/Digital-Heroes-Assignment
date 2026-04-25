"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SubscriptionVerifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const subscribed = searchParams.get("subscribed");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscribed !== "true" || !sessionId) return;

    fetch(`/api/verify-subscription?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          console.error("Subscription verification failed:", data.error);
          setError(data.error ?? "Failed to record subscription.");
        }
      })
      .catch((err) => {
        console.error("Subscription verification error:", err);
        setError("Failed to verify subscription. Please contact support.");
      });
  }, [sessionId, subscribed, router]);

  if (error) {
    return (
      <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
        Subscription recorded with Stripe but failed to update your account:{" "}
        {error}. Please contact support.
      </div>
    );
  }

  return null;
}
