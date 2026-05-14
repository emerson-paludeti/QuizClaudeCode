'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuiz } from '@/hooks/useQuiz'
import { ProgressBar } from '@/components/ProgressBar'
import { QuestionCard } from '@/components/QuestionCard'
import { AnswerButtons } from '@/components/AnswerButtons'
import { FeedbackPanel } from '@/components/FeedbackPanel'
import { ResultScreen } from '@/components/ResultScreen'
import type { QuizLevel } from '@/lib/types'

interface QuizScreenProps {
  level: QuizLevel
}

export function QuizScreen({ level }: QuizScreenProps) {
  const router = useRouter()
  const {
    questions,
    currentQuestion,
    currentIndex,
    score,
    feedbackState,
    lastResult,
    isLoading,
    isComplete,
    startQuiz,
    submitAnswer,
    nextQuestion,
  } = useQuiz()

  useEffect(() => {
    startQuiz(level)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  if (isLoading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Carregando perguntas…
        </p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <ResultScreen
        score={score}
        total={questions.length}
        level={level}
        onRetry={() => startQuiz(level)}
        onChangeLevel={() => router.push('/')}
      />
    )
  }

  if (!currentQuestion) return null

  const isLast = currentIndex === questions.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-sm transition-colors hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Voltar
        </button>
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
      </div>

      <QuestionCard question={currentQuestion} score={score} />

      <AnswerButtons
        onAnswer={submitAnswer}
        feedbackState={feedbackState}
        correctAnswer={lastResult?.correctAnswer}
        userAnswer={lastResult !== null ? (feedbackState === 'correct' ? lastResult.correctAnswer : !lastResult.correctAnswer) : undefined}
        disabled={isLoading || feedbackState !== 'idle'}
      />

      <FeedbackPanel
        result={lastResult}
        feedbackState={feedbackState}
        onNext={nextQuestion}
        isLast={isLast}
      />
    </motion.div>
  )
}
