import { createClient } from '@/lib/supabase/server'

const GENERATIONS_LIMIT = parseInt(process.env.GENERATIONS_LIMIT_PER_PERIOD || '10')
const QUOTA_PERIOD_DAYS = parseInt(process.env.QUOTA_PERIOD_DAYS || '30')

interface QuotaCheck {
  allowed: boolean
  used: number
  limit: number
  periodStart: string
  periodEnd: string
  remaining: number
}

export async function checkAndUpdateQuota(userId: string): Promise<QuotaCheck> {
  const supabase = await createClient()

  const now = new Date()
  const periodStart = new Date(now)
  periodStart.setHours(0, 0, 0, 0)

  const periodEnd = new Date(periodStart)
  periodEnd.setDate(periodEnd.getDate() + QUOTA_PERIOD_DAYS)

  // Get or create current quota period
  let { data: quota, error: fetchError } = await supabase
    .from('user_quotas')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', now.toISOString())
    .order('period_start', { ascending: false })
    .limit(1)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching quota:', fetchError)
    throw new Error('Failed to check quota')
  }

  // Create new quota period if none exists or current one expired
  if (!quota) {
    const { data: newQuota, error: createError } = await supabase
      .from('user_quotas')
      .insert({
        user_id: userId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        generations_used: 0,
        generations_limit: GENERATIONS_LIMIT,
      })
      .select()
      .single()

    if (createError || !newQuota) {
      console.error('Error creating quota:', createError)
      throw new Error('Failed to create quota')
    }

    quota = newQuota
  }

  const quotaCheck: QuotaCheck = {
    allowed: quota.generations_used < quota.generations_limit,
    used: quota.generations_used,
    limit: quota.generations_limit,
    periodStart: quota.period_start,
    periodEnd: quota.period_end,
    remaining: quota.generations_limit - quota.generations_used,
  }

  // If allowed, increment the counter
  if (quotaCheck.allowed) {
    const { error: updateError } = await supabase
      .from('user_quotas')
      .update({
        generations_used: quota.generations_used + 1,
      })
      .eq('id', quota.id)

    if (updateError) {
      console.error('Error updating quota:', updateError)
      throw new Error('Failed to update quota')
    }

    quotaCheck.used += 1
    quotaCheck.remaining -= 1
  }

  return quotaCheck
}

export async function getUserQuota(userId: string): Promise<QuotaCheck | null> {
  const supabase = await createClient()

  const now = new Date()

  const { data: quota, error } = await supabase
    .from('user_quotas')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', now.toISOString())
    .order('period_start', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching quota:', error)
    return null
  }

  return {
    allowed: quota.generations_used < quota.generations_limit,
    used: quota.generations_used,
    limit: quota.generations_limit,
    periodStart: quota.period_start,
    periodEnd: quota.period_end,
    remaining: quota.generations_limit - quota.generations_used,
  }
}
