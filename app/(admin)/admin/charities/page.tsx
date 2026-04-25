import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminCharitiesClient from "./AdminCharitiesClient";

export default async function AdminCharitiesPage() {
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

  const { data: charities } = await adminSupabase
    .from("charities")
    .select("id, name, slug, category, description, image_url, total_raised, is_active")
    .order("name");

  return <AdminCharitiesClient charities={charities ?? []} />;
}
