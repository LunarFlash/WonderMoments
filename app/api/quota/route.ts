import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserQuota } from '@/lib/quota'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const quota = await getUserQuota(user.id)

    if (!quota) {
      return NextResponse.json({
        used: 0,
        limit: parseInt(process.env.GENERATIONS_LIMIT_PER_PERIOD || '10'),
        remaining: parseInt(process.env.GENERATIONS_LIMIT_PER_PERIOD || '10'),
        periodStart: new Date().toISOString(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    return NextResponse.json(quota)
  } catch (error) {
    console.error('Quota check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
