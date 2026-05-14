'use server'

import { supabaseServer } from '@/lib/supabase/server'
import type { AnswerPayload, AnswerResult } from '@/lib/types'

export async function validateAnswer(payload: AnswerPayload): Promise<AnswerResult> {
  const { sessionId, questionId, userAnswer } = payload

  // Validate session exists and is not completed
  const { data: session, error: sessionError } = await supabaseServer
    .from('quiz_sessions')
    .select('id, score, total, completed')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Sessão inválida')
  }
  if (session.completed) {
    throw new Error('Sessão já finalizada')
  }

  // Fetch correct answer via service role (bypasses RLS)
  const { data: question, error: questionError } = await supabaseServer
    .from('questions')
    .select('answer, explanation')
    .eq('id', questionId)
    .single()

  if (questionError || !question) {
    throw new Error('Pergunta não encontrada')
  }

  const correctAnswer = question.answer as boolean
  const explanation = question.explanation as string
  const isCorrect = userAnswer === correctAnswer

  // Record the answer
  await supabaseServer.from('session_answers').insert({
    session_id: sessionId,
    question_id: questionId,
    user_answer: userAnswer,
    correct: isCorrect,
  })

  // Count answers so far to determine if this is the last one
  const { count } = await supabaseServer
    .from('session_answers')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  const answeredCount = count ?? 0
  const newScore = isCorrect ? (session.score as number) + 1 : (session.score as number)

  if (isCorrect) {
    await supabaseServer
      .from('quiz_sessions')
      .update({ score: newScore })
      .eq('id', sessionId)
  }

  if (answeredCount >= (session.total as number)) {
    await supabaseServer
      .from('quiz_sessions')
      .update({ completed: true, score: newScore })
      .eq('id', sessionId)
  }

  return {
    correct: isCorrect,
    correctAnswer,
    explanation,
    currentScore: newScore,
  }
}
