-- ============================================================
-- Schema
-- ============================================================

CREATE TYPE quiz_level AS ENUM ('basico', 'intermediario', 'avancado');

CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level         quiz_level NOT NULL,
  question_text TEXT NOT NULL,
  answer        BOOLEAN NOT NULL,
  explanation   TEXT NOT NULL,
  sort_order    INTEGER,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quiz_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level         TEXT NOT NULL,
  score         INTEGER DEFAULT 0,
  total         INTEGER DEFAULT 10,
  completed     BOOLEAN DEFAULT false,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

CREATE TABLE session_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id   UUID REFERENCES questions(id),
  user_answer   BOOLEAN NOT NULL,
  is_correct    BOOLEAN NOT NULL,
  answered_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_questions_level ON questions(level) WHERE active = true;
CREATE INDEX idx_session_answers_session ON session_answers(session_id);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_public_read" ON questions
  FOR SELECT USING (active = true);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Seed: Nível Básico (10 perguntas)
-- ============================================================

INSERT INTO questions (level, question_text, answer, explanation, sort_order) VALUES
(
  'basico',
  'Claude Code é uma ferramenta de linha de comando (CLI) desenvolvida pela Anthropic.',
  true,
  'Claude Code é o CLI oficial da Anthropic, disponível também como app desktop (Mac/Windows) e extensões para VS Code e JetBrains.',
  1
),
(
  'basico',
  'Claude Code só pode ser usado por programadores experientes.',
  false,
  'Claude Code é projetado para qualquer perfil — gestores, analistas e não-técnicos também podem usá-lo para automatizar tarefas e obter respostas sobre projetos.',
  2
),
(
  'basico',
  'Claude Code está disponível como extensão do VS Code e JetBrains.',
  true,
  'Além do CLI e do app desktop, Claude Code possui integrações nativas com VS Code e IDEs da família JetBrains.',
  3
),
(
  'basico',
  'Claude Code pode criar pull requests no GitHub automaticamente.',
  true,
  'Claude Code pode usar o CLI do GitHub (gh) para criar PRs, comentar em issues e interagir com repositórios remotos.',
  4
),
(
  'basico',
  'Claude Code funciona completamente offline, sem precisar de internet.',
  false,
  'Claude Code requer conexão com a internet para se comunicar com a API da Anthropic, que processa as solicitações.',
  5
),
(
  'basico',
  'Claude Code pode ler e editar arquivos no computador do usuário.',
  true,
  'Claude Code tem ferramentas nativas de leitura (Read), edição (Edit) e escrita (Write) de arquivos locais.',
  6
),
(
  'basico',
  'Claude Code é completamente gratuito para qualquer usuário, sem restrições.',
  false,
  'Claude Code requer uma conta na Anthropic e está sujeito aos planos de uso e limites de consumo da API.',
  7
),
(
  'basico',
  'Claude Code só funciona com projetos escritos em Python.',
  false,
  'Claude Code é agnóstico de linguagem — suporta Python, JavaScript, TypeScript, Go, Rust, Java e qualquer outra linguagem.',
  8
),
(
  'basico',
  'O arquivo CLAUDE.md serve para dar instruções persistentes ao Claude Code sobre o projeto.',
  true,
  'O CLAUDE.md é lido automaticamente pelo Claude Code no início de cada sessão, permitindo documentar convenções, comandos e contexto do projeto.',
  9
),
(
  'basico',
  'Claude Code pode executar testes automatizados de um projeto de software.',
  true,
  'Claude Code pode rodar comandos como npm test, pytest, go test e interpretar os resultados para corrigir falhas automaticamente.',
  10
);

-- ============================================================
-- Seed: Nível Intermediário (10 perguntas)
-- ============================================================

INSERT INTO questions (level, question_text, answer, explanation, sort_order) VALUES
(
  'intermediario',
  'Claude Code possui um sistema de memória persistente que lembra informações entre conversas diferentes.',
  true,
  'Claude Code tem um sistema de memória baseado em arquivos que persiste entre sessões, armazenando preferências do usuário e contexto do projeto.',
  1
),
(
  'intermediario',
  'Os "hooks" do Claude Code permitem executar comandos automaticamente antes ou depois de ações específicas.',
  true,
  'Hooks são configurados no settings.json e disparam scripts shell em resposta a eventos como início de ferramenta, fim de sessão, entre outros.',
  2
),
(
  'intermediario',
  'Claude Code não pode ser integrado a pipelines de CI/CD.',
  false,
  'Claude Code pode ser usado em pipelines de CI/CD via modo não-interativo, executando tarefas automatizadas como revisão de código, testes e deploys.',
  3
),
(
  'intermediario',
  'Claude Code suporta múltiplos agentes trabalhando em paralelo no mesmo projeto.',
  true,
  'O Claude Code suporta arquitetura multi-agente, onde subagentes podem ser disparados em paralelo para realizar tarefas independentes simultaneamente.',
  4
),
(
  'intermediario',
  'Claude Code não tem acesso ao histórico de commits do git do projeto.',
  false,
  'Claude Code pode executar comandos git (git log, git diff, git blame) e usa essas informações para entender o contexto e histórico do código.',
  5
),
(
  'intermediario',
  'As "skills" são scripts ou instruções que estendem as capacidades padrão do Claude Code.',
  true,
  'Skills são conjuntos de instruções especializadas que ensinam o Claude Code a realizar tarefas específicas, como criar PRDs, revisar PRs ou configurar ambientes.',
  6
),
(
  'intermediario',
  'Claude Code pode fazer requisições e buscar conteúdo de páginas web.',
  true,
  'Via ferramentas como WebFetch e WebSearch, Claude Code pode acessar URLs, buscar informações na web e incorporar esse conteúdo nas suas respostas.',
  7
),
(
  'intermediario',
  'Claude Code pode criar e gerenciar tarefas agendadas (cron jobs) remotamente.',
  true,
  'Claude Code suporta agentes agendados via CronCreate, permitindo criar rotinas automáticas que executam em horários definidos.',
  8
),
(
  'intermediario',
  'Subagentes disparados pelo Claude Code compartilham automaticamente o contexto da conversa principal.',
  false,
  'Subagentes iniciam sem memória da conversa principal — o contexto precisa ser explicitamente passado no prompt do subagente pelo agente que o criou.',
  9
),
(
  'intermediario',
  'O arquivo settings.json permite configurar permissões, variáveis de ambiente e comportamentos do Claude Code.',
  true,
  'O settings.json é o arquivo central de configuração do Claude Code, controlando permissões de ferramentas, hooks, variáveis de ambiente e outras preferências.',
  10
);

-- ============================================================
-- Seed: Nível Avançado (10 perguntas)
-- ============================================================

INSERT INTO questions (level, question_text, answer, explanation, sort_order) VALUES
(
  'avancado',
  'O modo "worktree" cria uma cópia isolada do repositório para que o subagente trabalhe sem afetar a branch principal.',
  true,
  'Com isolation: ''worktree'', o Claude Code cria um git worktree temporário onde o subagente opera de forma isolada, sendo limpo automaticamente se não houver mudanças.',
  1
),
(
  'avancado',
  'Claude Code suporta prompt caching para reduzir o custo e a latência das chamadas à API.',
  true,
  'O prompt caching da Anthropic é suportado pelo Claude Code e pode ser ativado em aplicações que usam o SDK, reduzindo significativamente o custo de contextos repetidos.',
  2
),
(
  'avancado',
  'O modo "fast" do Claude Code usa um modelo menor e mais barato para gerar respostas mais rápidas.',
  false,
  'O modo fast usa o Claude Opus 4.6 com output mais rápido — não é um modelo menor. Pode ser ativado com /fast e está disponível apenas no Opus 4.6.',
  3
),
(
  'avancado',
  'MCP servers no Claude Code só podem ser configurados e executados localmente na máquina do usuário.',
  false,
  'MCP servers podem ser tanto locais quanto remotos — Claude Code suporta conexão com servidores MCP externos via rede, ampliando as integrações disponíveis.',
  4
),
(
  'avancado',
  'Claude Code pode ser usado como SDK para construir agentes de IA customizados em aplicações próprias.',
  true,
  'O Claude Agent SDK permite usar o Claude Code como base para construir agentes customizados com ferramentas, memória e fluxos de trabalho específicos.',
  5
),
(
  'avancado',
  'Os planos (plans) criados durante uma sessão do Claude Code persistem automaticamente para sessões futuras.',
  false,
  'Planos são contextuais à sessão atual. Para persistência entre sessões, o desenvolvedor deve salvar o plano explicitamente como um arquivo no projeto.',
  6
),
(
  'avancado',
  'Usuários podem criar skills personalizadas para o Claude Code e usá-las como comandos /skill-name.',
  true,
  'O sistema de skills do Claude Code é extensível — usuários podem criar e compartilhar skills customizadas que enriquecem as capacidades padrão da ferramenta.',
  7
),
(
  'avancado',
  'O modelo padrão atual do Claude Code é o Claude Sonnet 4.6.',
  true,
  'O Claude Sonnet 4.6 (ID: claude-sonnet-4-6) é o modelo padrão do Claude Code, oferecendo equilíbrio entre capacidade e custo.',
  8
),
(
  'avancado',
  'Subagentes iniciados com isolation: worktree fazem merge automático dos seus commits na branch do agente pai.',
  false,
  'Nenhum merge automático ocorre — o worktree é apenas isolado. O agente pai recebe o resultado e decide manualmente o que incorporar.',
  9
),
(
  'avancado',
  'Claude Code pode ser acionado remotamente via RemoteTrigger, permitindo integração com sistemas externos.',
  true,
  'O RemoteTrigger permite que sistemas externos disparem ações no Claude Code, viabilizando integrações com webhooks, pipelines de CI/CD e ferramentas de automação.',
  10
);
