'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult<T = void> = { success: boolean; data?: T; error?: string }

async function checkAdmin(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.' }

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { ok: false, error: 'Unauthorized.' }
  return { ok: true }
}

export async function addCharity(formData: {
  name: string
  slug: string
  category: string
  description: string
  image_url: string
}): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase.from('charities').insert({
    name: formData.name,
    slug: formData.slug,
    category: formData.category,
    description: formData.description,
    image_url: formData.image_url,
    status: 'active',
    total_raised: 0,
    subscriber_count: 0,
  })

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/charities')
  return { success: true }
}

export async function updateCharity(
  id: string,
  formData: {
    name: string
    slug: string
    category: string
    description: string
    image_url: string
    status: string
  }
): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase
    .from('charities')
    .update({
      name: formData.name,
      slug: formData.slug,
      category: formData.category,
      description: formData.description,
      image_url: formData.image_url,
      status: formData.status,
    })
    .eq('id', id)

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/charities')
  return { success: true }
}

export async function deleteCharity(id: string): Promise<ActionResult> {
  const { ok, error } = await checkAdmin()
  if (!ok) return { success: false, error }

  const adminSupabase = await createAdminClient()
  const { error: dbError } = await adminSupabase
    .from('charities')
    .delete()
    .eq('id', id)

  if (dbError) return { success: false, error: dbError.message }
  revalidatePath('/admin/charities')
  return { success: true }
}
