'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type ActionResult<T = void> = { success: boolean; data?: T; error?: string }

export async function createCheckoutSession(
  plan: 'monthly' | 'yearly',
  charityId: string,
  charityContributionPct: number
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'You must be logged in to subscribe.' }

  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID!
    : process.env.STRIPE_MONTHLY_PRICE_ID!

  /*
  // Get or create Stripe customer
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = sub?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    metadata: {
      user_id: user.id,
      charity_id: charityId,
      charity_contribution_pct: String(charityContributionPct),
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        charity_id: charityId,
        charity_contribution_pct: String(charityContributionPct),
      },
    },
  })

  if (!session.url) return { success: false, error: 'Failed to create checkout session.' }
  return { success: true, data: { url: session.url } }
  */

  // MOCK SUBSCRIPTION CREATION
  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: user.id,
    stripe_customer_id: 'mock_customer_id',
    stripe_sub_id: 'mock_sub_id',
    plan,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    charity_id: charityId,
    charity_contribution_pct: charityContributionPct,
  })

  if (subError) return { success: false, error: subError.message }
  return { success: true, data: { url: '/dashboard?subscribed=true' } }
}

export async function createPortalSession(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  /*
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.stripe_customer_id) {
    return { success: false, error: 'No active subscription found.' }
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  })

  return { success: true, data: { url: portalSession.url } }
  */
  return { success: true, data: { url: '/dashboard/settings' } }
}

export async function updateSubscriptionCharity(
  userId: string,
  newCharityId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) return { success: false, error: 'Unauthorized.' }

  const { error } = await supabase
    .from('subscriptions')
    .update({ charity_id: newCharityId })
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateContributionPct(
  userId: string,
  newPct: number
): Promise<ActionResult> {
  if (newPct < 10 || newPct > 30) {
    return { success: false, error: 'Contribution percentage must be between 10% and 30%.' }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) return { success: false, error: 'Unauthorized.' }

  const { error } = await supabase
    .from('subscriptions')
    .update({ charity_contribution_pct: newPct })
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) return { success: false, error: error.message }
  return { success: true }
}
