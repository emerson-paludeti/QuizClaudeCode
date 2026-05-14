'use server'

import { supabaseClient } from '@/lib/supabase/client'
import { shuffleArray } from '@/lib/utils'
import type { QuestionPublic, QuizLevel } from '@/lib/types'

export async function getQuestions(level: QuizLevel): Promise<QuestionPublic[]> {
  let query = supabaseClient
    .from('questions')
    .select('id, level, question_text')
    .eq('active', true)

  if (level !== 'aleatorio') {
    query = query.eq('level', level)
  }

  const { data, error } = await query

  if (error) throw new Error(`Erro ao buscar perguntas: ${error.message}`)
  if (!data || data.length === 0) throw new Error('Nenhuma pergunta encontrada')

  const shuffled = shuffleArray(data)
  const selected = shuffled.slice(0, 10)

  return selected.map((q) => ({
    id: q.id as string,
    level: q.level as QuizLevel,
    questionText: q.question_text as string,
  }))
}
