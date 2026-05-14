'use client'

import { motion } from 'framer-motion'
import type { FeedbackState } from '@/lib/types'

interface AnswerButtonsProps {
  onAnswer: (value: boolean) => void
  feedbackState: FeedbackState
  correctAnswer?: boolean
  userAnswer?: boolean
  disabled: boolean
}

export function AnswerButtons({
  onAnswer,
  feedbackState,
  correctAnswer,
  userAnswer,
  disabled,
}: AnswerButtonsProps) {
  function getButtonStyle(buttonValue: boolean) {
    if (feedbackState === 'idle') {
      return {
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }
    }
    const wasChosen = userAnswer === buttonValue
    const isCorrectBtn = correctAnswer === buttonValue

    if (isCorrectBtn) {
      return {
        backgroundColor: 'var(--correct-bg)',
        borderColor: 'var(--correct)',
        color: 'var(--correct)',
      }
    }
    if (wasChosen && !isCorrectBtn) {
      return {
        backgroundColor: 'var(--wrong-bg)',
        borderColor: 'var(--wrong)',
        color: 'var(--wrong)',
      }
    }
    return {
      backgroundColor: 'var(--bg-elevated)',
      borderColor: 'var(--border)',
      color: 'var(--text-muted)',
    }
  }

  function getAnimation(buttonValue: boolean) {
    if (feedbackState === 'idle') return {}
    const wasChosen = userAnswer === buttonValue
    const isCorrectBtn = correctAnswer === buttonValue

    if (wasChosen && isCorrectBtn) {
      return { scale: [1, 1.05, 1], transition: { duration: 0.35 } }
    }
    if (wasChosen && !isCorrectBtn) {
      return { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } }
    }
    return {}
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {[true, false].map((value) => (
        <motion.button
          key={String(value)}
          onClick={() => !disabled && onAnswer(value)}
          animate={getAnimation(value)}
          whileHover={!disabled && feedbackState === 'idle' ? { scale: 1.02, borderColor: 'var(--border-hover)' } : {}}
          className="py-4 rounded-xl border-2 text-base font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
          style={getButtonStyle(value)}
          disabled={disabled}
        >
          {value ? '✓ VERDADEIRO' : '✗ FALSO'}
        </motion.button>
      ))}
    </div>
  )
}
