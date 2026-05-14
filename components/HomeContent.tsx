'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LevelSelector } from '@/components/LevelSelector'
import { useState } from 'react'
import type { QuizLevel } from '@/lib/types'

export function HomeContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  function handleSelect(level: QuizLevel) {
    setIsLoading(true)
    router.push(`/quiz/${level}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <span className="text-3xl">🤖</span>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Claude Code Quiz
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Teste o seu conhecimento sobre Claude Code — de iniciante a especialista.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          ESCOLHA UM NÍVEL
        </p>
        <LevelSelector onSelect={handleSelect} isLoading={isLoading} />
      </div>
    </motion.div>
  )
}
