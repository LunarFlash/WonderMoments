import { Template } from '@/types/database'

export function getCollections(templates: Template[]): string[] {
  const collections = new Set(templates.map(t => t.collection))
  return Array.from(collections).sort()
}

export function groupTemplatesByCollection(templates: Template[]): Record<string, Template[]> {
  return templates.reduce((acc, template) => {
    if (!acc[template.collection]) {
      acc[template.collection] = []
    }
    acc[template.collection].push(template)
    return acc
  }, {} as Record<string, Template[]>)
}
