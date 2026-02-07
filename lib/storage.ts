import { createClient } from '@/lib/supabase/client'

export async function uploadImage(file: File, userId: string, bucket: string = 'user-uploads'): Promise<string | null> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading image:', error)
    return null
  }

  // Get public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteImage(url: string, bucket: string = 'user-uploads'): Promise<boolean> {
  const supabase = createClient()

  // Extract file path from URL
  const urlParts = url.split('/')
  const fileName = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/')

  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName])

  if (error) {
    console.error('Error deleting image:', error)
    return false
  }

  return true
}
