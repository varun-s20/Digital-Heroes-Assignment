import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CharityDashboardClient from "./CharityDashboardClient";

export default async function CharityDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/charity");

  // Fetch user's active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, charity_id, charity_contribution_pct, plan, status")
    .eq("user_id", user.id)
    .single();

  // Fetch all active charities
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name, slug, category, description, image_url, total_raised, subscriber_count")
    .eq("status", "active")
    .order("name");

  const planAmount = subscription?.plan === "yearly" ? 99.90 / 12 : 9.99;

  return (
    <CharityDashboardClient
      userId={user.id}
      subscriptionId={subscription?.id ?? null}
      currentCharityId={subscription?.charity_id ?? null}
      currentContributionPct={subscription?.charity_contribution_pct ?? 10}
      charities={charities ?? []}
      planAmount={planAmount}
    />
  );
}
