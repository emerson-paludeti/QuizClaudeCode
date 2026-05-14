'use client'

import { motion } from 'framer-motion'
import type { QuizLevel } from '@/lib/types'

interface LevelSelectorProps {
  onSelect: (level: QuizLevel) => void
  isLoading: boolean
}

const levels: { value: QuizLevel; label: string; description: string; emoji: string }[] = [
  {
    value: 'basico',
    label: 'Básico',
    description: 'Conceitos fundamentais do Claude Code',
    emoji: '🌱',
  },
  {
    value: 'intermediario',
    label: 'Intermediário',
    description: 'Hooks, skills, agentes e integrações',
    emoji: '⚡',
  },
  {
    value: 'avancado',
    label: 'Avançado',
    description: 'MCP, worktrees, SDK e poder total',
    emoji: '🚀',
  },
  {
    value: 'aleatorio',
    label: 'Aleatório',
    description: 'Mistura dos três níveis',
    emoji: '🎲',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function LevelSelector({ onSelect, isLoading }: LevelSelectorProps) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {levels.map((level) => (
        <motion.button
          key={level.value}
          variants={item}
          onClick={() => !isLoading && onSelect(level.value)}
          whileHover={{ scale: 1.02, borderColor: 'var(--border-hover)' }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <span className="text-2xl mt-0.5">{level.emoji}</span>
          <div>
            <div className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              {level.label}
            </div>
            <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {level.description}
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  )
}
