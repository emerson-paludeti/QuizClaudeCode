import { notFound } from 'next/navigation'
import { QuizScreen } from '@/components/QuizScreen'
import type { QuizLevel } from '@/lib/types'

const VALID_LEVELS: QuizLevel[] = ['basico', 'intermediario', 'avancado', 'aleatorio']

interface PageProps {
  params: Promise<{ level: string }>
}

export default async function QuizPage({ params }: PageProps) {
  const { level } = await params

  if (!VALID_LEVELS.includes(level as QuizLevel)) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[640px]">
        <QuizScreen level={level as QuizLevel} />
      </div>
    </main>
  )
}

export function generateStaticParams() {
  return VALID_LEVELS.map((level) => ({ level }))
}
