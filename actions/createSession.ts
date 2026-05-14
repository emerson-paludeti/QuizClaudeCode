'use server'

import { supabaseServer } from '@/lib/supabase/server'
import { getQuestions } from './getQuestions'
import type { QuestionPublic, QuizLevel } from '@/lib/types'

interface CreateSessionResult {
  sessionId: string
  questions: QuestionPublic[]
}

export async function createSession(level: QuizLevel): Promise<CreateSessionResult> {
  const questions = await getQuestions(level)

  const { data, error } = await supabaseServer
    .from('quiz_sessions')
    .insert({ level, total: questions.length })
    .select('id')
    .single()

  if (error) throw new Error(`Erro ao criar sessão: ${error.message}`)

  return { sessionId: data.id as string, questions }
}
