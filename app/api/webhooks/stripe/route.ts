import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import {
  sendWelcomeEmail,
  sendSubscriptionLapsedEmail,
} from '@/lib/email'
import Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  /*
  const body = await req.text()
  ...
  */
  return NextResponse.json({ received: true, message: 'Stripe webhooks are currently disabled.' }, { status: 200 })
}
