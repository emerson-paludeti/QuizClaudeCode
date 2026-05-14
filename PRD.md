# PRD — Claude Code Quiz
**Versão:** 2.0 | **Data:** 2026-05-12 | **Status:** Aprovado para desenvolvimento

---

## 1. Visão do Produto

**Nome:** Claude Code Quiz  
**Tagline:** Teste o seu conhecimento sobre Claude Code — de iniciante a especialista.  
**Tipo:** Web app interativo com validação server-side e proteção anti-cheat  
**Objetivo:** Educar e engajar usuários de todos os perfis sobre as capacidades do Claude Code por meio de um quiz de verdadeiro ou falso com feedback explicativo imediato.

---

## 2. Problema e Oportunidade

Muitos usuários — de gestores a desenvolvedores — desconhecem as capacidades reais do Claude Code. Um quiz lúdico e educativo resolve esse problema ao ensinar enquanto testa, com engajamento ativo e feedback que reforça o aprendizado. A validação server-side garante integridade: as respostas corretas nunca chegam ao cliente, impedindo trapaças via DevTools.

---

## 3. Público-Alvo

| Perfil | Nível | Objetivo |
|---|---|---|
| Gestores, PMs, não-técnicos | Básico | Entender o valor de negócio do Claude Code |
| Devs iniciantes | Intermediário | Conhecer comandos, integrações e fluxos |
| Devs avançados / Power users | Avançado | Testar domínio de agentes, MCP, hooks, skills |

---

## 4. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS | 3.x |
| Animações | Framer Motion | 11.x |
| Banco de dados | Supabase (PostgreSQL) | latest |
| ORM / Client | Supabase JS SDK | 2.x |
| Deploy | Vercel | — |
| Runtime | Node.js | 20.x LTS |

---

## 5. Funcionalidades (MVP)

### F1 — Tela Inicial (Level Selector)
- Exibe logo, título e descrição do quiz
- 4 botões de modo: **Básico**, **Intermediário**, **Avançado**, **Aleatório**
- Animação de entrada com Framer Motion (fade + slide up)
- Dark mode por padrão com acento laranja Anthropic (`#E8834A`)

### F2 — Tela de Quiz
- Uma pergunta por vez, buscada via Server Action (nunca exposta no bundle client)
- Barra de progresso animada (Framer Motion)
- Contador "Pergunta X de 10" + placar parcial visível
- Botões **VERDADEIRO** e **FALSO** com hover animado

### F3 — Feedback Imediato (por pergunta)
- Ao responder, a resposta é enviada ao servidor via Server Action
- O servidor valida e retorna: `{ correct: boolean, explanation: string, correctAnswer: boolean }`
- Se **errou**: botão escolhido fica vermelho + botão correto fica verde + explicação exibida
- Se **acertou**: botão escolhido fica verde + explicação exibida (reforço positivo)
- Animação de feedback com Framer Motion (shake no erro, pulse no acerto)
- Botão **Próxima Pergunta** aparece após o feedback

### F4 — Tela de Resultado Final
- Placar total: "X de 10 corretas"
- Classificação por faixa:
  - 0–39%: "Continue estudando!"
  - 40–69%: "Bom progresso!"
  - 70–89%: "Muito bem!"
  - 90–100%: "Especialista Claude Code!"
- Animação de entrada da pontuação (contador animado)
- Botões: **Tentar Novamente** e **Escolher Outro Nível**
- Sessão salva no Supabase ao finalizar

### F5 — Anti-Cheat Server-Side
- As respostas corretas ficam **apenas no banco de dados** — nunca no bundle JS do cliente
- Cada sessão recebe um `session_id` (UUID) gerado no servidor
- Server Actions validam cada resposta individualmente
- Rate limiting: máximo 60 requisições por IP por minuto (Vercel Edge)
- Respostas fora de ordem ou com session_id inválido são rejeitadas com erro 400

### F6 — Dark Mode
- Tema escuro por padrão (sem toggle no MVP)
- Paleta definida no Design System abaixo

---

## 6. Design System

### Paleta de Cores

```css
/* Backgrounds */
--bg-primary:    #0F0F14;   /* fundo da página */
--bg-card:       #1A1A24;   /* cards e containers */
--bg-elevated:   #22223A;   /* elementos elevados */

/* Acento Anthropic */
--accent:        #E8834A;   /* laranja primário */
--accent-hover:  #F09460;   /* hover do laranja */

/* Feedback */
--correct:       #4CAF7D;   /* verde acerto */
--correct-bg:    #1A3A2A;   /* fundo do acerto */
--wrong:         #E05C5C;   /* vermelho erro */
--wrong-bg:      #3A1A1A;   /* fundo do erro */

/* Texto */
--text-primary:  #F0F0F0;
--text-secondary:#A0A0B0;
--text-muted:    #606070;

/* Bordas */
--border:        #2A2A3A;
--border-hover:  #E8834A;
```

### Tipografia
- Fonte: `Inter` (Google Fonts)
- Pergunta: `text-xl font-semibold` (20px, 600)
- Corpo: `text-base` (16px, 400)
- Labels: `text-sm` (14px, 500)

### Breakpoints (Tailwind padrão)
- Mobile: `< 640px` — botões empilhados, padding reduzido
- Tablet: `640px–1024px` — layout centralizado
- Desktop: `> 1024px` — card com max-width 640px centralizado

---

## 7. Schema SQL (Supabase / PostgreSQL)

```sql
-- Enum de níveis
CREATE TYPE quiz_level AS ENUM ('basico', 'intermediario', 'avancado');

-- Tabela de perguntas (respostas ficam aqui, nunca expostas ao cliente)
CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level         quiz_level NOT NULL,
  question_text TEXT NOT NULL,
  answer        BOOLEAN NOT NULL,        -- true = Verdadeiro, false = Falso
  explanation   TEXT NOT NULL,
  sort_order    INTEGER,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Sessões de quiz
CREATE TABLE quiz_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level         TEXT NOT NULL,           -- 'basico' | 'intermediario' | 'avancado' | 'aleatorio'
  score         INTEGER DEFAULT 0,
  total         INTEGER DEFAULT 10,
  completed     BOOLEAN DEFAULT false,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

-- Respostas individuais por sessão
CREATE TABLE session_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id   UUID REFERENCES questions(id),
  user_answer   BOOLEAN NOT NULL,
  is_correct    BOOLEAN NOT NULL,
  answered_at   TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_questions_level ON questions(level) WHERE active = true;
CREATE INDEX idx_session_answers_session ON session_answers(session_id);

-- RLS: perguntas são leitura pública (apenas id, level, question_text — sem answer)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_public_read" ON questions
  FOR SELECT USING (active = true);

-- RLS: sessões e respostas só via service role (server-side)
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
```

> **Importante:** A coluna `answer` da tabela `questions` deve ser acessada apenas via `SUPABASE_SERVICE_ROLE_KEY` no servidor. O client público (`SUPABASE_ANON_KEY`) nunca recebe essa coluna — garantido por política de Row Level Security.

---

## 8. Tipos TypeScript

```typescript
// lib/types.ts

export type QuizLevel = 'basico' | 'intermediario' | 'avancado' | 'aleatorio'

// Shape retornado ao cliente (sem a resposta correta)
export interface QuestionPublic {
  id: string
  level: QuizLevel
  questionText: string
}

// Shape interno do servidor (com a resposta — nunca enviado ao client)
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

export type FeedbackState = 'idle' | 'correct' | 'wrong'
```

---

## 9. Estrutura de Pastas

```
quizclaudecodeprojeto/
├── app/
│   ├── layout.tsx                  # RootLayout com fonte Inter e metadata
│   ├── page.tsx                    # Tela inicial — seleção de nível
│   ├── quiz/
│   │   └── [level]/
│   │       └── page.tsx            # Tela do quiz (nível dinâmico)
│   └── globals.css                 # Tailwind base + variáveis CSS
│
├── components/
│   ├── LevelSelector.tsx           # 4 botões de nível com animação
│   ├── QuestionCard.tsx            # Card da pergunta atual
│   ├── AnswerButtons.tsx           # Botões V/F com estado de feedback
│   ├── FeedbackPanel.tsx           # Explicação pós-resposta
│   ├── ProgressBar.tsx             # Barra animada de progresso
│   └── ResultScreen.tsx            # Tela final com placar e classificação
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client (anon key — client-side)
│   │   └── server.ts               # Supabase server client (service role — server-side)
│   ├── types.ts                    # Todos os tipos TypeScript
│   └── utils.ts                    # Helpers: shuffle, classification, formatScore
│
├── actions/
│   ├── createSession.ts            # Server Action: cria sessão no Supabase
│   ├── getQuestions.ts             # Server Action: busca perguntas (sem answer)
│   └── validateAnswer.ts           # Server Action: valida resposta, retorna feedback
│
├── hooks/
│   └── useQuiz.ts                  # Estado do quiz: questão atual, score, feedback
│
├── public/
│   └── favicon.ico
│
├── .env.local                      # Variáveis de ambiente locais (não commitar)
├── .env.example                    # Template das variáveis necessárias
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── PRD.md
```

---

## 10. Variáveis de Ambiente

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>         # client-side (leitura pública)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>      # server-side apenas (validação)

# Vercel (preenchido automaticamente no deploy)
VERCEL_URL=
```

---

## 11. Fluxo de Dados (Anti-Cheat)

```
Cliente                          Servidor (Next.js)              Supabase
  |                                     |                            |
  |-- Escolhe nível ------------------>|                            |
  |                          createSession()                        |
  |                                     |--- INSERT quiz_sessions -->|
  |                                     |<-- { session_id } --------|
  |<-- { session_id, questions[] } -----|  (questions SEM answer)   |
  |                                     |                            |
  |-- Responde pergunta (V/F) -------->|                            |
  |   { sessionId, questionId,          |                            |
  |     userAnswer }                    |                            |
  |                          validateAnswer()                        |
  |                                     |--- SELECT answer WHERE id--|
  |                                     |<-- { answer, explanation --|
  |                                     |--- INSERT session_answers--|
  |                                     |--- UPDATE score se correto-|
  |<-- { correct, correctAnswer,        |                            |
  |      explanation, currentScore } ---|                            |
  |                                     |                            |
  |-- Última resposta respondida ------>|                            |
  |                          (completeSession)                       |
  |                                     |--- UPDATE completed=true --|
  |<-- { finalScore, classification } --|                            |
```

---

## 12. Banco de Perguntas

### Nível Básico (10 perguntas)

| ID | Pergunta | Resposta | Explicação |
|---|---|---|---|
| b01 | Claude Code é uma ferramenta de linha de comando (CLI) desenvolvida pela Anthropic. | **V** | Claude Code é o CLI oficial da Anthropic, disponível também como app desktop (Mac/Windows) e extensões para VS Code e JetBrains. |
| b02 | Claude Code só pode ser usado por programadores experientes. | **F** | Claude Code é projetado para qualquer perfil — gestores, analistas e não-técnicos também podem usá-lo para automatizar tarefas e obter respostas sobre projetos. |
| b03 | Claude Code está disponível como extensão do VS Code e JetBrains. | **V** | Além do CLI e do app desktop, Claude Code possui integrações nativas com VS Code e IDEs da família JetBrains. |
| b04 | Claude Code pode criar pull requests no GitHub automaticamente. | **V** | Claude Code pode usar o CLI do GitHub (gh) para criar PRs, comentar em issues e interagir com repositórios remotos. |
| b05 | Claude Code funciona completamente offline, sem precisar de internet. | **F** | Claude Code requer conexão com a internet para se comunicar com a API da Anthropic, que processa as solicitações. |
| b06 | Claude Code pode ler e editar arquivos no computador do usuário. | **V** | Claude Code tem ferramentas nativas de leitura (Read), edição (Edit) e escrita (Write) de arquivos locais. |
| b07 | Claude Code é completamente gratuito para qualquer usuário, sem restrições. | **F** | Claude Code requer uma conta na Anthropic e está sujeito aos planos de uso e limites de consumo da API. |
| b08 | Claude Code só funciona com projetos escritos em Python. | **F** | Claude Code é agnóstico de linguagem — suporta Python, JavaScript, TypeScript, Go, Rust, Java e qualquer outra linguagem. |
| b09 | O arquivo CLAUDE.md serve para dar instruções persistentes ao Claude Code sobre o projeto. | **V** | O CLAUDE.md é lido automaticamente pelo Claude Code no início de cada sessão, permitindo documentar convenções, comandos e contexto do projeto. |
| b10 | Claude Code pode executar testes automatizados de um projeto de software. | **V** | Claude Code pode rodar comandos como npm test, pytest, go test e interpretar os resultados para corrigir falhas automaticamente. |

### Nível Intermediário (10 perguntas)

| ID | Pergunta | Resposta | Explicação |
|---|---|---|---|
| i01 | Claude Code possui um sistema de memória persistente que lembra informações entre conversas diferentes. | **V** | Claude Code tem um sistema de memória baseado em arquivos que persiste entre sessões, armazenando preferências do usuário e contexto do projeto. |
| i02 | Os "hooks" do Claude Code permitem executar comandos automaticamente antes ou depois de ações específicas. | **V** | Hooks são configurados no settings.json e disparam scripts shell em resposta a eventos como início de ferramenta, fim de sessão, entre outros. |
| i03 | Claude Code não pode ser integrado a pipelines de CI/CD. | **F** | Claude Code pode ser usado em pipelines de CI/CD via modo não-interativo, executando tarefas automatizadas como revisão de código, testes e deploys. |
| i04 | Claude Code suporta múltiplos agentes trabalhando em paralelo no mesmo projeto. | **V** | O Claude Code suporta arquitetura multi-agente, onde subagentes podem ser disparados em paralelo para realizar tarefas independentes simultaneamente. |
| i05 | Claude Code não tem acesso ao histórico de commits do git do projeto. | **F** | Claude Code pode executar comandos git (git log, git diff, git blame) e usa essas informações para entender o contexto e histórico do código. |
| i06 | As "skills" são scripts ou instruções que estendem as capacidades padrão do Claude Code. | **V** | Skills são conjuntos de instruções especializadas que ensinam o Claude Code a realizar tarefas específicas, como criar PRDs, revisar PRs ou configurar ambientes. |
| i07 | Claude Code pode fazer requisições e buscar conteúdo de páginas web. | **V** | Via ferramentas como WebFetch e WebSearch, Claude Code pode acessar URLs, buscar informações na web e incorporar esse conteúdo nas suas respostas. |
| i08 | Claude Code pode criar e gerenciar tarefas agendadas (cron jobs) remotamente. | **V** | Claude Code suporta agentes agendados via CronCreate, permitindo criar rotinas automáticas que executam em horários definidos. |
| i09 | Subagentes disparados pelo Claude Code compartilham automaticamente o contexto da conversa principal. | **F** | Subagentes iniciam sem memória da conversa principal — o contexto precisa ser explicitamente passado no prompt do subagente pelo agente que o criou. |
| i10 | O arquivo settings.json permite configurar permissões, variáveis de ambiente e comportamentos do Claude Code. | **V** | O settings.json é o arquivo central de configuração do Claude Code, controlando permissões de ferramentas, hooks, variáveis de ambiente e outras preferências. |

### Nível Avançado (10 perguntas)

| ID | Pergunta | Resposta | Explicação |
|---|---|---|---|
| a01 | O modo "worktree" cria uma cópia isolada do repositório para que o subagente trabalhe sem afetar a branch principal. | **V** | Com isolation: 'worktree', o Claude Code cria um git worktree temporário onde o subagente opera de forma isolada, sendo limpo automaticamente se não houver mudanças. |
| a02 | Claude Code suporta prompt caching para reduzir o custo e a latência das chamadas à API. | **V** | O prompt caching da Anthropic é suportado pelo Claude Code e pode ser ativado em aplicações que usam o SDK, reduzindo significativamente o custo de contextos repetidos. |
| a03 | O modo "fast" do Claude Code usa um modelo menor e mais barato para gerar respostas mais rápidas. | **F** | O modo fast usa o Claude Opus 4.6 com output mais rápido — não é um modelo menor. Pode ser ativado com /fast e está disponível apenas no Opus 4.6. |
| a04 | MCP servers no Claude Code só podem ser configurados e executados localmente na máquina do usuário. | **F** | MCP servers podem ser tanto locais quanto remotos — Claude Code suporta conexão com servidores MCP externos via rede, ampliando as integrações disponíveis. |
| a05 | Claude Code pode ser usado como SDK para construir agentes de IA customizados em aplicações próprias. | **V** | O Claude Agent SDK permite usar o Claude Code como base para construir agentes customizados com ferramentas, memória e fluxos de trabalho específicos. |
| a06 | Os planos (plans) criados durante uma sessão do Claude Code persistem automaticamente para sessões futuras. | **F** | Planos são contextuais à sessão atual. Para persistência entre sessões, o desenvolvedor deve salvar o plano explicitamente como um arquivo no projeto. |
| a07 | Usuários podem criar skills personalizadas para o Claude Code e usá-las como comandos /skill-name. | **V** | O sistema de skills do Claude Code é extensível — usuários podem criar e compartilhar skills customizadas que enriquecem as capacidades padrão da ferramenta. |
| a08 | O modelo padrão atual do Claude Code é o Claude Sonnet 4.6. | **V** | O Claude Sonnet 4.6 (ID: claude-sonnet-4-6) é o modelo padrão do Claude Code, oferecendo equilíbrio entre capacidade e custo. |
| a09 | Subagentes iniciados com isolation: worktree fazem merge automático dos seus commits na branch do agente pai. | **F** | Nenhum merge automático ocorre — o worktree é apenas isolado. O agente pai recebe o resultado e decide manualmente o que incorporar. |
| a10 | Claude Code pode ser acionado remotamente via RemoteTrigger, permitindo integração com sistemas externos. | **V** | O RemoteTrigger permite que sistemas externos disparem ações no Claude Code, viabilizando integrações com webhooks, pipelines de CI/CD e ferramentas de automação. |

---

## 13. Critérios de Aceite (Definition of Done)

### Funcional
- [ ] Tela inicial exibe os 4 modos de jogo com animação de entrada
- [ ] As 30 perguntas estão cadastradas no Supabase com resposta e explicação
- [ ] A coluna `answer` nunca aparece no bundle JavaScript do cliente (verificável via DevTools)
- [ ] Ao errar, o botão errado fica vermelho e o correto fica verde simultaneamente
- [ ] Ao acertar, o botão correto fica verde
- [ ] A explicação é sempre exibida após a resposta (acerto ou erro)
- [ ] Barra de progresso reflete a questão atual corretamente
- [ ] Tela de resultado exibe placar e classificação correta por faixa
- [ ] O quiz pode ser reiniciado sem recarregar a página
- [ ] Sessão e respostas são salvas no Supabase ao finalizar

### Segurança / Anti-Cheat
- [ ] `SUPABASE_SERVICE_ROLE_KEY` usada apenas em Server Actions (nunca exposta ao client)
- [ ] `session_id` gerado no servidor; respostas com session_id inválido retornam 400
- [ ] Rate limiting ativo: máximo 60 req/min por IP

### Design
- [ ] Dark mode com paleta definida no Design System
- [ ] Acento laranja `#E8834A` aplicado em botões principais e highlights
- [ ] Animações Framer Motion em: entrada de telas, barra de progresso, feedback de resposta, resultado final
- [ ] Layout responsivo funciona em 375px (mobile), 768px (tablet) e 1280px (desktop)

### Qualidade
- [ ] Zero erros de TypeScript (`tsc --noEmit` passa sem erros)
- [ ] Nenhuma variável de ambiente sensível exposta via `NEXT_PUBLIC_`
- [ ] Deploy na Vercel funciona sem configuração adicional além das env vars

---

## 14. Fora do Escopo (MVP)

- Autenticação de usuários / login
- Ranking global / leaderboard
- Compartilhamento de resultado em redes sociais
- Light mode / toggle de tema
- Modo multiplayer
- Suporte a múltiplos idiomas (apenas pt-BR no MVP)
- Painel de administração para gerenciar perguntas

---

## 15. Próximos Passos Pós-MVP

1. **Leaderboard** — ranking com nickname e pontuação via Supabase
2. **Compartilhamento** — card de resultado para compartilhar no LinkedIn/Twitter
3. **Expansão do banco** — 10 perguntas adicionais por nível (total: 60)
4. **Admin panel** — interface para adicionar/editar perguntas sem acessar o banco diretamente
5. **Modo tempo** — cronômetro regressivo por pergunta com penalidade de score

---

*Documento gerado em: 2026-05-12 | Versão 2.0 — Stack definitiva aprovada*
