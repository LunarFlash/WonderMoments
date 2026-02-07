'use client'

import { useState, useEffect } from 'react'
import { Template } from '@/types/database'
import { groupTemplatesByCollection } from '@/lib/template-utils'
import TemplateCollection from './TemplateCollection'
import ImageUpload from './ImageUpload'
import { uploadImage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface GeneratorPageProps {
  templates: Template[]
}

interface QuotaInfo {
  used: number
  limit: number
  remaining: number
}

export default function GeneratorPage({ templates }: GeneratorPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [subjectName, setSubjectName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()
  const collections = groupTemplatesByCollection(templates)

  useEffect(() => {
    checkAuth()
    fetchQuota()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchQuota = async () => {
    try {
      const response = await fetch('/api/quota')
      if (response.ok) {
        const data = await response.json()
        setQuota(data)
      }
    } catch (err) {
      console.error('Error fetching quota:', err)
    }
  }

  const handleImageSelect = (file: File, preview: string) => {
    setUploadedFile(file)
    setPreviewUrl(preview)
    setError(null)
  }

  const handleGenerate = async () => {
    if (!selectedTemplate || !uploadedFile || !user) {
      setError('Please select a template and upload an image')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImageUrl(null)

    try {
      // Upload image to Supabase Storage
      const uploadedUrl = await uploadImage(uploadedFile, user.id)

      if (!uploadedUrl) {
        throw new Error('Failed to upload image')
      }

      // Call generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          inputImageUrl: uploadedUrl,
          userInputs: {
            subject: subjectName || 'person',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl)
        setQuota(data.quota)
      } else {
        throw new Error(data.error || 'No image generated')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSignIn = async () => {
    // Redirect to auth page or show auth modal
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                WonderMoments
              </h1>
              <p className="text-gray-600 mt-1">Transform your kids and pets into magical characters</p>
            </div>
            {user ? (
              <div className="text-right">
                <div className="text-sm text-gray-600">Generations</div>
                <div className="text-2xl font-bold">
                  {quota ? `${quota.remaining}/${quota.limit}` : '—'}
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Sign in to start creating magical moments
            </h2>
            <p className="text-gray-600 mb-8">
              Create amazing transformations of your kids and pets
            </p>
            <button
              onClick={handleSignIn}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition text-lg"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Step 1: Select Template */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Step 1: Choose a Template</h2>
              {Object.entries(collections).map(([collectionName, collectionTemplates]) => (
                <TemplateCollection
                  key={collectionName}
                  collectionName={collectionName}
                  templates={collectionTemplates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                />
              ))}
            </section>

            {/* Step 2: Upload Image & Generate */}
            {selectedTemplate && (
              <section className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Step 2: Upload Your Photo</h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="e.g., Max, Luna, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                    />

                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      currentImage={previewUrl || undefined}
                      disabled={isGenerating}
                    />

                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleGenerate}
                      disabled={!uploadedFile || isGenerating || (quota?.remaining || 0) <= 0}
                      className={`mt-6 w-full py-4 rounded-lg font-semibold text-lg transition ${
                        isGenerating || !uploadedFile || (quota?.remaining || 0) <= 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Magic ✨'}
                    </button>

                    {quota && quota.remaining <= 0 && (
                      <p className="mt-2 text-red-600 text-sm text-center">
                        You've reached your generation limit for this period
                      </p>
                    )}
                  </div>

                  {/* Result Display */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Preview</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                      {generatedImageUrl ? (
                        <div className="relative w-full h-full min-h-[350px]">
                          <Image
                            src={generatedImageUrl}
                            alt="Generated"
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <p>Your generated image will appear here</p>
                        </div>
                      )}
                    </div>
                    {generatedImageUrl && (
                      <a
                        href={generatedImageUrl}
                        download
                        className="mt-4 block w-full text-center py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Download Image
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
