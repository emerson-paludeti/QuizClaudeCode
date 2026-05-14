'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { QuestionPublic } from '@/lib/types'

interface QuestionCardProps {
  question: QuestionPublic
  score: number
}

export function QuestionCard({ question, score }: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent)' }}>
            {question.level.charAt(0).toUpperCase() + question.level.slice(1)}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Pontos: {score}
          </span>
        </div>
        <p className="text-xl font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {question.questionText}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}
