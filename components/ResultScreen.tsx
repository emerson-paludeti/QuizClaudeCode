'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getClassification } from '@/lib/utils'
import type { QuizLevel } from '@/lib/types'

interface ResultScreenProps {
  score: number
  total: number
  level: QuizLevel
  onRetry: () => void
  onChangeLevel: () => void
}

export function ResultScreen({ score, total, level, onRetry, onChangeLevel }: ResultScreenProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const classification = getClassification(percentage)

  useEffect(() => {
    setDisplayScore(0)
    let current = 0
    const step = Math.ceil(score / 20)
    const interval = setInterval(() => {
      current = Math.min(current + step, score)
      setDisplayScore(current)
      if (current >= score) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [score])

  const levelLabels: Record<QuizLevel, string> = {
    basico: 'Básico',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
    aleatorio: 'Aleatório',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 py-6"
    >
      <div
        className="w-28 h-28 rounded-full flex flex-col items-center justify-center border-4"
        style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <span className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
          {displayScore}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          de {total}
        </span>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {classification}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {percentage}% de acerto · nível {levelLabels[level]}
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl font-semibold text-base transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          Tentar Novamente
        </button>
        <button
          onClick={onChangeLevel}
          className="w-full py-3 rounded-xl font-semibold text-base border-2 transition-colors hover:border-[var(--border-hover)]"
          style={{
            backgroundColor: 'transparent',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          Escolher Outro Nível
        </button>
      </div>
    </motion.div>
  )
}
