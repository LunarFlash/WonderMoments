import GeneratorPage from '@/components/GeneratorPage'
import { getTemplates } from '@/lib/templates'

export default async function Home() {
  const templates = await getTemplates()

  return <GeneratorPage templates={templates} />
}
