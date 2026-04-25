import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'BirdieFund <varun.jcfanx@gmail.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'varun.jcfanx@gmail.com'

type SendResult = { success: boolean; error?: string }

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Email Error]', msg)
    return { success: false, error: msg }
  }
}

const accent = '#00E599'
const bg = '#050608'
const surface = '#0d0f12'
const text = '#f0f0f0'
const muted = '#6b7280'

function emailWrapper(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{background:${bg};font-family:system-ui,-apple-system,sans-serif;color:${text};margin:0;padding:0}
  .container{max-width:600px;margin:0 auto;padding:40px 24px}
  .header{text-align:center;padding:24px 0;border-bottom:1px solid #1f2937;margin-bottom:32px}
  .logo{font-size:24px;font-weight:700;color:${accent}}
  .footer{text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #1f2937;color:${muted};font-size:12px}
  .btn{display:inline-block;padding:14px 28px;background:${accent};color:#000;font-weight:700;text-decoration:none;border-radius:8px}
  .card{background:${surface};border-radius:12px;padding:24px;margin:16px 0}
  h1{color:${text};font-size:28px;margin:0 0 8px}p{color:#9ca3af;line-height:1.6;margin:8px 0}
  .number-badge{display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;border-radius:50%;background:${accent};color:#000;font-weight:700;font-size:16px;margin:4px}
  </style></head><body><div class="container">
  <div class="header"><div class="logo">⛳ BirdieFund</div></div>
  ${content}
  <div class="footer"><p>BirdieFund &mdash; Playing for good.</p><p><a href="{{unsubscribe_url}}" style="color:${muted}">Unsubscribe</a></p></div>
  </div></body></html>`
}

export async function sendWelcomeEmail(to: string, name: string): Promise<SendResult> {
  const html = emailWrapper(`
    <h1>Welcome, ${name}! 🎉</h1>
    <p>You've joined Digital Heroes — a platform where your golf game funds causes that matter.</p>
    <div class="card">
      <p><strong>What's next?</strong></p>
      <ul style="color:#9ca3af">
        <li>Log your Stableford scores</li>
        <li>Watch the monthly draw</li>
        <li>Win prizes and support your charity</li>
      </ul>
    </div>
    <p style="text-align:center;margin-top:32px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a></p>
  `)
  return send(to, 'Welcome to Digital Heroes! ⛳', html)
}

export async function sendSubscriptionLapsedEmail(to: string, name: string): Promise<SendResult> {
  const html = emailWrapper(`
    <h1>Your subscription has lapsed</h1>
    <p>Hi ${name}, your payment didn't go through and your subscription is now inactive.</p>
    <div class="card"><p>You won't be included in the next draw until you resubscribe. Your score history is safe.</p></div>
    <p style="text-align:center;margin-top:32px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe" class="btn">Resubscribe Now</a></p>
  `)
  return send(to, 'Action Required: Your Digital Heroes subscription has lapsed', html)
}

export async function sendDrawResultsEmail(
  to: string,
  name: string,
  drawnNumbers: number[],
  userScores: number[],
  matchCount: number,
  tier: string | null,
  prizeAmount: number | null
): Promise<SendResult> {
  const drawnHtml = drawnNumbers.map(n => `<span class="number-badge">${n}</span>`).join('')
  const tierHtml = tier
    ? `<div class="card"><p style="color:${accent};font-size:20px;font-weight:700">🏆 You matched ${matchCount} numbers! (${tier.replace('_', ' ').toUpperCase()})</p><p>Prize: <strong style="color:${accent}">£${prizeAmount?.toLocaleString()}</strong> — check your winnings page to submit proof.</p></div>`
    : `<div class="card"><p>You matched ${matchCount} number(s) this month. Better luck next time!</p></div>`

  const html = emailWrapper(`
    <h1>This month's draw results</h1>
    <p>Hi ${name}, here are the numbers drawn this month:</p>
    <div style="text-align:center;margin:24px 0">${drawnHtml}</div>
    <p>Your scores: <strong>${userScores.join(', ') || 'None logged'}</strong></p>
    ${tierHtml}
    <p style="text-align:center;margin-top:32px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/draws" class="btn">View Draw Details</a></p>
  `)
  return send(to, '⛳ This month\'s Digital Heroes draw results are in!', html)
}

export async function sendWinnerNotificationEmail(
  to: string,
  name: string,
  tier: string,
  amount: number
): Promise<SendResult> {
  const html = emailWrapper(`
    <h1>🎉 Congratulations, ${name}!</h1>
    <p>You've won a prize in this month's Digital Heroes draw!</p>
    <div class="card">
      <p>Tier: <strong>${tier.replace('_', ' ').toUpperCase()}</strong></p>
      <p>Amount: <strong style="color:${accent};font-size:28px">£${amount.toLocaleString()}</strong></p>
    </div>
    <p>To claim your prize, please submit proof of your identity via your winnings page.</p>
    <p style="text-align:center;margin-top:32px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" class="btn">Submit Proof Now</a></p>
  `)
  return send(to, '🎉 You won in the Digital Heroes draw!', html)
}

export async function sendProofSubmittedAdminEmail(
  winnerName: string,
  tier: string,
  amount: number,
  winningsId: string
): Promise<SendResult> {
  const html = emailWrapper(`
    <h1>New proof submission</h1>
    <div class="card">
      <p>Winner: <strong>${winnerName}</strong></p>
      <p>Tier: <strong>${tier.replace('_', ' ').toUpperCase()}</strong></p>
      <p>Amount: <strong>£${amount.toLocaleString()}</strong></p>
    </div>
    <p style="text-align:center;margin-top:32px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/winners" class="btn">Review in Admin Panel</a></p>
  `)
  return send(ADMIN_EMAIL, `[Admin] New proof submission from ${winnerName}`, html)
}

export async function sendWinnerVerifiedEmail(
  to: string,
  name: string,
  amount: number
): Promise<SendResult> {
  const html = emailWrapper(`
    <h1>Your proof has been approved ✅</h1>
    <p>Hi ${name}, great news — your identity has been verified.</p>
    <div class="card">
      <p>Prize amount: <strong style="color:${accent}">£${amount.toLocaleString()}</strong></p>
      <p>Our team will arrange your bank transfer within 5 business days.</p>
    </div>
    <p style="text-align:center;margin-top:32px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" class="btn">View Winnings</a></p>
  `)
  return send(to, '✅ Your Digital Heroes prize has been verified!', html)
}

export async function sendWinnerRejectedEmail(
  to: string,
  name: string,
  reason: string
): Promise<SendResult> {
  const html = emailWrapper(`
    <h1>Proof submission update</h1>
    <p>Hi ${name}, unfortunately your proof submission was not accepted.</p>
    <div class="card" style="border-left:4px solid #ef4444">
      <p><strong>Reason:</strong> ${reason}</p>
    </div>
    <p>Please re-upload a clearer or correct document via your winnings page.</p>
    <p style="text-align:center;margin-top:32px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" class="btn">Resubmit Proof</a></p>
  `)
  return send(to, 'Update on your Digital Heroes prize proof', html)
}
