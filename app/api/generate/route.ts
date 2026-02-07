import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage, processPromptTemplate } from '@/lib/gemini'
import { checkAndUpdateQuota } from '@/lib/quota'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { templateId, inputImageUrl, userInputs } = body

    if (!templateId || !inputImageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check user quota
    const quotaCheck = await checkAndUpdateQuota(user.id)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: 'Generation limit exceeded', quota: quotaCheck },
        { status: 429 }
      )
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Create generation record
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        template_id: templateId,
        input_image_url: inputImageUrl,
        user_inputs: userInputs || null,
        status: 'processing',
      })
      .select()
      .single()

    if (generationError || !generation) {
      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    // Process prompt template
    const inputs = {
      subject: userInputs?.subject || 'person',
      ...userInputs,
    }
    const prompt = processPromptTemplate(template.prompt_template, inputs)

    // Generate image
    const result = await generateImage(prompt, inputImageUrl)

    if (!result.success) {
      // Update generation record with error
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: result.error,
        })
        .eq('id', generation.id)

      return NextResponse.json(
        { error: result.error, generationId: generation.id },
        { status: 500 }
      )
    }

    // Update generation record with result
    await supabase
      .from('generations')
      .update({
        status: 'completed',
        generated_image_url: result.imageUrl,
      })
      .eq('id', generation.id)

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      imageUrl: result.imageUrl,
      quota: quotaCheck,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
