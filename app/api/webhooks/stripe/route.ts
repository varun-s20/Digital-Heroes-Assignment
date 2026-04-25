import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    if (!sig || !webhookSecret) return NextResponse.json({ error: 'Missing secrets' }, { status: 400 })
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const metadata = session.metadata

    if (metadata?.user_id) {
      // Retrieve subscription to get current period end
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      const plan = subscription.items.data[0].price.id === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly'
      
      const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', metadata.user_id).single()
      
      let dbError;
      if (existingSub) {
        const { error } = await supabase.from('subscriptions').update({
          stripe_customer_id: customerId,
          stripe_sub_id: subscriptionId,
          plan: plan,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          charity_id: metadata.charity_id,
          charity_contribution_pct: parseInt(metadata.charity_contribution_pct || '10', 10),
        }).eq('id', existingSub.id)
        dbError = error;
      } else {
        const { error } = await supabase.from('subscriptions').insert({
          user_id: metadata.user_id,
          stripe_customer_id: customerId,
          stripe_sub_id: subscriptionId,
          plan: plan,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          charity_id: metadata.charity_id,
          charity_contribution_pct: parseInt(metadata.charity_contribution_pct || '10', 10),
        })
        dbError = error;
      }

      if (dbError) {
        console.error('Error inserting/updating subscription:', dbError)
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    
    const { error } = await supabase.from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_sub_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
