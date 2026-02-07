import { createClient } from '@/lib/supabase/server'
import { Template } from '@/types/database'

export async function getTemplates(): Promise<Template[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('collection', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return data || []
}

export async function getTemplatesByCollection(collection: string): Promise<Template[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('collection', collection)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return data || []
}

export async function getTemplate(id: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching template:', error)
    return null
  }

  return data
}

export { getCollections, groupTemplatesByCollection } from './template-utils'
