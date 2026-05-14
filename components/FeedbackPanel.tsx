'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { AnswerResult, FeedbackState } from '@/lib/types'

interface FeedbackPanelProps {
  result: AnswerResult | null
  feedbackState: FeedbackState
  onNext: () => void
  isLast: boolean
}

export function FeedbackPanel({ result, feedbackState, onNext, isLast }: FeedbackPanelProps) {
  const isCorrect = feedbackState === 'correct'

  return (
    <AnimatePresence>
      {feedbackState !== 'idle' && result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: isCorrect ? 'var(--correct-bg)' : 'var(--wrong-bg)',
            borderColor: isCorrect ? 'var(--correct)' : 'var(--wrong)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-base font-bold"
              style={{ color: isCorrect ? 'var(--correct)' : 'var(--wrong)' }}
            >
              {isCorrect ? '✓ Correto!' : '✗ Incorreto'}
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {result.explanation}
          </p>
          <button
            onClick={onNext}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            {isLast ? 'Ver Resultado Final' : 'Próxima Pergunta →'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
