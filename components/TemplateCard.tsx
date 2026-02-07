'use client'

import { Template } from '@/types/database'
import Image from 'next/image'

interface TemplateCardProps {
  template: Template
  onSelect: (template: Template) => void
  isSelected?: boolean
}

export default function TemplateCard({ template, onSelect, isSelected = false }: TemplateCardProps) {
  return (
    <button
      onClick={() => onSelect(template)}
      className={`relative overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="aspect-square relative bg-gradient-to-br from-purple-100 to-pink-100">
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={template.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl">🦸</span>
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
        {template.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
        )}
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  )
}
