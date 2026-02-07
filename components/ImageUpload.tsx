'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void
  currentImage?: string
  disabled?: boolean
}

export default function ImageUpload({ onImageSelect, currentImage, disabled = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onImageSelect(file, result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all min-h-[300px] flex items-center justify-center
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {preview ? (
          <div className="relative w-full h-full min-h-[250px]">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded"
            />
          </div>
        ) : (
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-lg font-medium mb-2">Upload a photo</p>
            <p className="text-sm">Drag and drop or click to select</p>
            <p className="text-xs mt-2">Supports: JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      {preview && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setPreview(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
          className="mt-4 text-sm text-red-600 hover:text-red-700"
        >
          Remove image
        </button>
      )}
    </div>
  )
}
