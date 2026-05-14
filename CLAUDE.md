# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Claude Code Quiz** — A Next.js 15 web app (App Router, TypeScript) that quizzes users on Claude Code knowledge across three difficulty levels (Básico, Intermediário, Avançado). The defining architectural constraint is **server-side answer validation**: correct answers are never sent to the client, enforced at the database layer via Supabase RLS.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Type-check without emitting (must pass with zero errors)
npx tsc --noEmit

# Lint
npm run lint
```

## Environment Variables

Required in `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Public anon key (client-side reads, no answer column)
SUPABASE_SERVICE_ROLE_KEY=     # Service role (server-side only — never NEXT_PUBLIC_)
```

**Security rule:** `SUPABASE_SERVICE_ROLE_KEY` must only appear in files under `actions/` and `lib/supabase/server.ts`. It must never be prefixed with `NEXT_PUBLIC_` and must never be imported in any component, hook, or client-side file.

## Architecture

### Anti-Cheat: The Core Constraint

The `answer` column in the `questions` table is **never sent to the client**. This is enforced at two layers:
1. **Database**: Supabase RLS policy allows the anon key to SELECT questions, but only the columns `id`, `level`, `question_text`. The service role bypasses RLS and is used exclusively server-side.
2. **TypeScript types**: `QuestionPublic` (client shape) has no `answer` field. `QuestionPrivate` (server-only) extends it with `answer: boolean` and `explanation: string`.

### Two Supabase Clients

- `lib/supabase/client.ts` — uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`; safe for browser/components
- `lib/supabase/server.ts` — uses `SUPABASE_SERVICE_ROLE_KEY`; only imported inside `actions/`

Never import `lib/supabase/server.ts` from components, hooks, or `app/` pages directly.

### Server Actions (`actions/`)

All quiz logic runs through three Server Actions — never expose quiz state via API routes:

- `createSession.ts` — generates UUID `session_id`, inserts row into `quiz_sessions`, returns `{ session_id, questions[] }` (questions without `answer`)
- `getQuestions.ts` — fetches `QuestionPublic[]` for a given level using the anon client
- `validateAnswer.ts` — receives `{ sessionId, questionId, userAnswer }`, fetches the correct answer using service role, writes to `session_answers`, updates score, returns `AnswerResult`

Responses with invalid/out-of-order `session_id` are rejected with a 400.

### Data Flow

```
Client → createSession() → Supabase (INSERT quiz_sessions) → returns session_id + QuestionPublic[]
Client → validateAnswer() → Supabase (SELECT answer via service role) → returns { correct, correctAnswer, explanation, currentScore }
Client → (last answer) → validateAnswer() triggers UPDATE completed=true on quiz_sessions
```

### State Management

`hooks/useQuiz.ts` manages all client-side quiz state: current question index, score, feedback state (`'idle' | 'correct' | 'wrong'`), and session ID. It calls Server Actions and receives results — never the raw answer.

## Design System

Dark mode only. CSS custom properties defined in `app/globals.css`:

| Variable | Value | Use |
|---|---|---|
| `--bg-primary` | `#0F0F14` | Page background |
| `--bg-card` | `#1A1A24` | Cards/containers |
| `--accent` | `#E8834A` | Anthropic orange — primary buttons, highlights |
| `--correct` | `#4CAF7D` | Correct answer feedback |
| `--wrong` | `#E05C5C` | Wrong answer feedback |
| `--text-primary` | `#F0F0F0` | Main text |
| `--border` | `#2A2A3A` | Default borders |

Font: `Inter` (Google Fonts). Card max-width: `640px` centered. All transitions use Framer Motion 11: fade+slide-up on screen entry, animated progress bar, shake on wrong answer, pulse on correct answer, animated score counter on result screen.

## Database Schema (Supabase)

Three tables: `questions` (with `answer BOOLEAN` — server-only), `quiz_sessions`, `session_answers`. The `quiz_level` enum: `'basico' | 'intermediario' | 'avancado'`. The `aleatorio` mode is client-side only (random selection from all levels); it is not a database enum value.

RLS:
- `questions`: anon key may SELECT `id`, `level`, `question_text` only — `answer` is blocked
- `quiz_sessions` and `session_answers`: service role only

## Key TypeScript Types (`lib/types.ts`)

```typescript
export type QuizLevel = 'basico' | 'intermediario' | 'avancado' | 'aleatorio'
export type FeedbackState = 'idle' | 'correct' | 'wrong'

export interface QuestionPublic { id: string; level: QuizLevel; questionText: string }
export interface QuestionPrivate extends QuestionPublic { answer: boolean; explanation: string }
export interface AnswerPayload { sessionId: string; questionId: string; userAnswer: boolean }
export interface AnswerResult { correct: boolean; correctAnswer: boolean; explanation: string; currentScore: number }
```
