import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  /*
  const body = await req.text()
  ...
  */
  return NextResponse.json({ received: true, message: 'Stripe webhooks are currently disabled.' }, { status: 200 })
}
