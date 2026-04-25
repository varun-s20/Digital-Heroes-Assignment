import { createClient } from '@/lib/supabase/server'
import SubscribeClient from './SubscribeClient'

export default async function SubscribePage() {
  const supabase = await createClient()
  
  // Fetch active charities for the selection UI
  const { data: charities } = await supabase
    .from('charities')
    .select('id, name, slug, category, description, image_url')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })

  return <SubscribeClient charities={charities ?? []} />
}
