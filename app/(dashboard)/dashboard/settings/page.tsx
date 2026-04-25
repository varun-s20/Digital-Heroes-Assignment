import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/settings')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, plan, status, current_period_end, cancel_at_period_end, charity_contribution_pct')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return (
    <SettingsClient
      userId={user.id}
      profile={profile ?? { full_name: '', email: user.email ?? '', avatar_url: null }}
      subscription={subscription}
    />
  )
}
