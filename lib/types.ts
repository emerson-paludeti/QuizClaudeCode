export type QuizLevel = 'basico' | 'intermediario' | 'avancado' | 'aleatorio'

export type FeedbackState = 'idle' | 'correct' | 'wrong'

export interface QuestionPublic {
  id: string
  level: QuizLevel
  questionText: string
}

export interface QuestionPrivate extends QuestionPublic {
  answer: boolean
  explanation: string
}

export interface QuizSession {
  id: string
  level: QuizLevel
  score: number
  total: number
  completed: boolean
  createdAt: string
}

export interface AnswerPayload {
  sessionId: string
  questionId: string
  userAnswer: boolean
}

export interface AnswerResult {
  correct: boolean
  correctAnswer: boolean
  explanation: string
  currentScore: number
}

export interface QuizResult {
  score: number
  total: number
  percentage: number
  classification: string
}
