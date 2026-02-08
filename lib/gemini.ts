const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

export async function generateImage(
  prompt: string,
  imageBase64: string,
  imageMimeType: string
): Promise<{ success: boolean; imageUrl?: string; imageBase64?: string; imageMimeType?: string; error?: string }> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Using the person/subject in the provided photo as reference, generate a new image based on this prompt: ${prompt}. Make sure the generated image closely resembles the subject in the original photo.`,
              },
              {
                inline_data: {
                  mime_type: imageMimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', JSON.stringify(errorData))
      return {
        success: false,
        error: errorData.error?.message || `API error: ${response.status}`,
      }
    }

    const data = await response.json()

    // Look for generated image in the response
    const parts = data.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      const inlineData = part.inline_data || part.inlineData
      if (inlineData) {
        const generatedBase64 = inlineData.data
        const generatedMimeType = inlineData.mime_type || inlineData.mimeType || 'image/png'
        const dataUrl = `data:${generatedMimeType};base64,${generatedBase64}`
        return { success: true, imageUrl: dataUrl, imageBase64: generatedBase64, imageMimeType: generatedMimeType }
      }
    }

    return {
      success: false,
      error: 'No image was generated. The model returned only text.',
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export function processPromptTemplate(
  template: string,
  inputs: Record<string, string>
): string {
  let processedPrompt = template

  Object.entries(inputs).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), value)
  })

  return processedPrompt
}
