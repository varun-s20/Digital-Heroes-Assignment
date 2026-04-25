import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Uses service role to write subscription — no auth cookie dependency
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 },
      );
    }

    const userId = session.metadata?.user_id;
    if (!userId) {
      return NextResponse.json(
        { error: "No user_id in session metadata" },
        { status: 400 },
      );
    }

    if (!session.subscription) {
      return NextResponse.json(
        { error: "No subscription in session" },
        { status: 400 },
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );
    const plan =
      subscription.items.data[0].price.id === process.env.STRIPE_YEARLY_PRICE_ID
        ? "yearly"
        : "monthly";

    const subData = {
      stripe_customer_id: session.customer as string,
      stripe_sub_id: session.subscription as string,
      plan,
      status: subscription.status,
      current_period_start: new Date(
        subscription.items.data[0].current_period_start * 1000,
      ).toISOString(),
      current_period_end: new Date(
        subscription.items.data[0].current_period_end * 1000,
      ).toISOString(),
      charity_id: session.metadata?.charity_id || null,
      charity_contribution_pct: parseInt(
        session.metadata?.charity_contribution_pct || "10",
        10,
      ),
    };

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single();

    let dbError;
    if (existing) {
      const { error } = await supabase
        .from("subscriptions")
        .update(subData)
        .eq("id", existing.id);
      dbError = error;
    } else {
      const { error } = await supabase
        .from("subscriptions")
        .insert({ user_id: userId, ...subData });
      dbError = error;
    }

    if (dbError) {
      console.error("Supabase error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("verify-subscription error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
