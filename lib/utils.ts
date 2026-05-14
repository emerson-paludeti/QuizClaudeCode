export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getClassification(percentage: number): string {
  if (percentage >= 90) return 'Especialista Claude Code!'
  if (percentage >= 70) return 'Muito bem!'
  if (percentage >= 40) return 'Bom progresso!'
  return 'Continue estudando!'
}

export function formatScore(score: number, total: number): string {
  return `${score} de ${total}`
}
