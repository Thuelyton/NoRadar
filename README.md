# Radar — SaaS de recuperação de orçamentos

> ⚠️ **Produto em Fase 1 — validação de mercado.** O Portão de Decisão (seção 5 do `NoRadar.md`) ainda **não foi aprovado**. A construção desta estrutura foi uma **exceção autorizada pelo desenvolvedor em 2026-10-14**, registrada no `NoRadar.md` (seção 8). A Fase 1 segue aberta e os critérios de mercado continuam pendentes.

O Radar é uma plataforma de automação de vendas e recuperação de orçamentos parados, inicialmente para empresas de ar-condicionado, assistência técnica e manutenção. O WhatsApp é o canal principal de comunicação.

**Nesta etapa não existe integração real.** Não há conexão com WhatsApp, Meta ou OpenAI, não há banco de dados configurado e não há cobrança ou autenticação de produção. Todos os dados exibidos são **fictícios**, criados apenas para demonstrar a interface. O Radar ainda **não recuperou nenhuma venda ou receita real**.

## Arquitetura

Monorepo gerenciado por pnpm workspaces:

| Caminho | Papel |
|---|---|
| `apps/web/` | Aplicação web (Next.js 15, React 19, Tailwind CSS 4) |
| `apps/api/` | API REST (Fastify 5) — hoje com camada de dados **mockada** |
| `packages/shared/` | Tipos de domínio e schemas Zod compartilhados entre web e api |
| `docs/` | Documentação de planejamento e decisão (Markdown) |

A camada de dados é a decisão **D2 (2026-10-14)**: em vez de banco real, `apps/api` usa um repositório em memória (`RepositorioOrcamentosMemoria`) que implementa a interface `OrcamentoRepository`. Toda a aplicação depende da **interface**, não da implementação, para que a troca por PostgreSQL/Drizzle não altere rotas nem interface.

### Fluxo de dados

```
apps/web  ──fetch──▶  apps/api  ──▶  OrcamentoRepository  ──▶  RepositorioOrcamentosMemoria
   (Next.js)         (Fastify)         (interface)                (dados fictícios, em memória)
```

A resposta da API é validada por schemas Zod do `packages/shared` **nos dois lados** (API valida antes de servir; web valida antes de renderizar). Resposta fora do contrato vira erro — a interface nunca renderiza dado que não passou na validação.

## Pré-requisitos

- Node.js 24 (testado em v24.18.0)
- pnpm 10 (testado em 10.18.3) — `corepack enable` ativa o versionamento declarado em `package.json`

## Instalação

```bash
pnpm install
```

## Executar localmente

```bash
pnpm dev
```

Sobe API (porta 3001) e web (porta 3000) juntas.

| Endereço | Descrição |
|---|---|
| http://localhost:3000 | Painel do Radar (interface) |
| http://localhost:3000/fila | Fila de follow-up (interface, demonstração) |
| http://localhost:3001/api/saude | Verificação de saúde da API |
| http://localhost:3001/api/painel | Payload do painel (JSON) |
| http://localhost:3001/api/fila | Fila de follow-up ordenada por urgência (JSON) |
| http://localhost:3001/api/demonstracao/reinicializar | Reinício seguro dos dados fictícios (POST) |

### Fila de follow-up (demonstração)

A tela `/fila` mostra os orçamentos pendentes em ordem de urgência (mais dias sem resposta primeiro; empate, maior valor primeiro) e permite **registrar um resultado simulado** (`fechou`, `recusou`, `pediu_alteracao`, `sem_retorno`, `reativado_manutenção`). O registro altera o estado **em memória da API** apenas nesta sessão de demonstração: o item sai (ou permanece) na fila conforme o desfecho, e os indicadores são recalculados no servidor e devolvidos junto com a resposta.

- Rota: `POST /api/orcamentos/{id}/resultados` com corpo `{ "desfecho": "fechou", "canal": "whatsapp" }`.
- Resultado é aceito **apenas em orçamentos elegíveis** (aguardando follow-up):
  - `404 orcamento_nao_encontrado` — id inexistente;
  - `409 orcamento_ineligivel` — orçamento existe, mas está fora da fila (fechado, recusado, respondido ou expirado);
  - `400 json_invalido` — corpo JSON malformado (antes era 500 genérico);
  - `400 registro_invalido` — corpo válido como JSON, mas fora do contrato (ex.: data fora da faixa plausível 2000–2100 ou inexistente no calendário).
- Reinício seguro da demonstração: `POST /api/demonstracao/reinicializar` descarta os registros da sessão e devolve a fila restaurada (cópias defensivas da base fictícia — nada é compartilhado por referência).
- Nenhuma mensagem é enviada, nada é persistido e nada sai da memória da API.
- Todo payload carrega `"fonte": "dados_ficticios"` e o aviso de demonstração.
- Ao registrar o último item, a fila exibe o **estado vazio** (com os indicadores atualizados) em vez de uma lista pronta sem itens.

### Parâmetros de demonstração de estados

A interface tem botões "Demonstrar estados" (painel e fila) e, na fila, o botão **"Reiniciar demonstração"**. Por trás, eles usam `?simular=` na API:

| Valor | Efeito |
|---|---|
| *(ausente)* | Dados fictícios normais |
| `?simular=lento` | Atraso de 2,5 s — mostra o estado de carregamento |
| `?simular=vazio` | Lista vazia — mostra o estado vazio |
| `?simular=erro` | HTTP 500 — mostra o estado de erro |

## Verificação (lint + tipos + testes + build)

```bash
pnpm verificar
```

Equivalente a rodar, nesta ordem: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

Testes: **104** (API 53, Web 51).

Comandos individuais:

```bash
pnpm lint        # ESLint (typescript-eslint) nos apps
pnpm typecheck   # tsc --noEmit em shared, api e web
pnpm test        # Vitest na api e na web
pnpm build       # tsc (api/shared) + next build (web)
```

### Diretórios de build da web

`next dev` usa `.next/` e o `next build`/`next start` usam `.next-producao/` (configurado em `apps/web/next.config.ts`, sobrescrevível via `NEXT_DIST_DIR`). Validar a produção nunca apaga o cache do servidor de desenvolvimento — e vice-versa. Ambos os diretórios estão no `.gitignore`.

## Variáveis de ambiente

`.env.example` lista as variáveis. Copie para `.env.local` antes de preencher:

```bash
cp .env.example .env.local
```

Os campos de integração (Meta WhatsApp, OpenAI, banco) estão **vazios de propósito** e marcados como `[BLOQUEADO]`, com o motivo documentado. Nenhuma credencial foi inventada.

## Limites desta etapa

- Nenhuma integração real com WhatsApp, Meta ou OpenAI.
- Nenhum banco de dados configurado (camada mockada, decisão D2).
- Sem autenticação de produção e sem cobrança.
- Dados 100% fictícios; nenhum cliente real é usado.
- Nenhuma afirmação de receita ou venda recuperada.

## Documentação de decisão

Toda decisão, descoberta e mudança de fase está registrada nos arquivos Markdown em `docs/`, com o `NoRadar.md` como arquivo mestre. Não há decisão de produto fora desses arquivos.

## Repositório

Código versionado em `https://github.com/Thuelyton/NoRadar.git` (branch `master`). O Portão de Decisão do `docs/NoRadar.md` continua aberto: a construção foi uma exceção autorizada, não uma aprovação de produto.
