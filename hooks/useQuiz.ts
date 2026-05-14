'use client'

import { useState, useCallback } from 'react'
import { createSession } from '@/actions/createSession'
import { validateAnswer } from '@/actions/validateAnswer'
import type { QuestionPublic, QuizLevel, FeedbackState, AnswerResult } from '@/lib/types'

interface QuizState {
  sessionId: string | null
  questions: QuestionPublic[]
  currentIndex: number
  score: number
  feedbackState: FeedbackState
  lastResult: AnswerResult | null
  isLoading: boolean
  isComplete: boolean
}

const initialState: QuizState = {
  sessionId: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  feedbackState: 'idle',
  lastResult: null,
  isLoading: false,
  isComplete: false,
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>(initialState)

  const startQuiz = useCallback(async (level: QuizLevel) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { sessionId, questions } = await createSession(level)
      setState({
        ...initialState,
        sessionId,
        questions,
        isLoading: false,
      })
    } catch (err) {
      console.error('Erro ao iniciar quiz:', err)
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const submitAnswer = useCallback(
    async (userAnswer: boolean) => {
      const { sessionId, questions, currentIndex } = state
      if (!sessionId || state.feedbackState !== 'idle') return

      const currentQuestion = questions[currentIndex]
      setState((prev) => ({ ...prev, isLoading: true }))

      try {
        const result = await validateAnswer({
          sessionId,
          questionId: currentQuestion.id,
          userAnswer,
        })

        setState((prev) => ({
          ...prev,
          isLoading: false,
          feedbackState: result.correct ? 'correct' : 'wrong',
          lastResult: result,
          score: result.currentScore,
        }))
      } catch (err) {
        console.error('Erro ao validar resposta:', err)
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [state]
  )

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1
      if (nextIndex >= prev.questions.length) {
        return { ...prev, feedbackState: 'idle', lastResult: null, isComplete: true }
      }
      return { ...prev, currentIndex: nextIndex, feedbackState: 'idle', lastResult: null }
    })
  }, [])

  const resetQuiz = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
    currentQuestion: state.questions[state.currentIndex] ?? null,
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  }
}
