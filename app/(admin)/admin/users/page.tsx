import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  // Fetch all users with subscriptions and scores
  const { data: users } = await adminSupabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      role,
      created_at,
      subscriptions (
        id,
        plan,
        status,
        current_period_end,
        charity_contribution_pct
      ),
      scores (
        id,
        score,
        score_date
      )
    `)
    .order("created_at", { ascending: false });

  return <AdminUsersClient users={users ?? []} />;
}
