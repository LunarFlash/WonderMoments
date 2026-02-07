'use client'

import { Template } from '@/types/database'
import TemplateCard from './TemplateCard'

interface TemplateCollectionProps {
  collectionName: string
  templates: Template[]
  selectedTemplate: Template | null
  onSelectTemplate: (template: Template) => void
}

export default function TemplateCollection({
  collectionName,
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateCollectionProps) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6 capitalize">
        {collectionName.replace(/-/g, ' ')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onSelectTemplate}
            isSelected={selectedTemplate?.id === template.id}
          />
        ))}
      </div>
    </div>
  )
}
