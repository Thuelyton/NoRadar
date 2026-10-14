# PROJETO.md — Radar (SaaS de Recuperação de Orçamentos)

> **Este é o arquivo mestre.** Toda ação, decisão, descoberta e mudança de fase passa por aqui.
> Nada é feito sem antes estar neste arquivo; nada termina sem ser registrado aqui.

---

## 1. Resumo

| Item | Definição |
|---|---|
| Nome | **Radar** |
| Produto | Assistente comercial que acompanha orçamentos sem resposta, organiza retornos e mede vendas recuperadas |
| Segmento inicial | Ar-condicionado, assistência técnica e manutenção |
| Canal principal | WhatsApp (via meios oficiais) |
| Hipótese central | Empresas pequenas perdem vendas por falta de acompanhamento e pagariam para recuperá-las |
| Diferencial a testar | Camada de recuperação de receita, simples, que funciona com o processo que a empresa já usa (sem migração de sistema) |
| **Fase atual** | **Fase 1 — Auditoria e validação de mercado** |
| **Status** | **Em validação — nenhum código, instalação ou alteração de arquivos de projeto** |

---

## 2. Regras de funcionamento (como tudo passa por este arquivo)

1. **Antes de agir:** a ação precisa existir como item no checklist (seção 6). Se não existe, adicione primeiro.
2. **Durante:** marque o item como `[~]` (em andamento).
3. **Depois:** marque `[x]`, anote o resultado no **Registro de decisões e evidências** (seção 8) com data.
4. **Nenhuma implementação** (código, dependências, infraestrutura) antes do **Portão de Decisão** (seção 5) aprovar.
5. **Sem evidência, sem afirmação.** Números de mercado, preços e funcionalidades de concorrentes só entram com fonte e data.
6. **Valores ilustrativos** (ex.: painel com R$ 3.200) nunca são tratados como resultado real.
7. Mudou o escopo? Registre na seção 8 e atualize o checklist.

Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluído · `[!]` bloqueado · `[-]` descartado

---

## 3. Escopo

### Entra no MVP (somente se aprovado)
- Fila diária de follow-up (ordenada por prazo, valor e probabilidade de retorno)
- Mensagens contextualizadas sugeridas por IA, **aprovadas pelo vendedor**
- Registro de resultado (respondeu, pediu alteração, recusou, fechou)
- Reativação de manutenção preventiva
- Painel de retorno financeiro (orçamentos acompanhados, vendas fechadas, receita atribuída)

### Fica de fora (primeira versão)
- Chatbot autônomo, discador, emissão fiscal, estoque
- Gestão completa de ordens de serviço
- Competir com CRMs completos em todas as funcionalidades

---

## 4. Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Concorrência já oferece funil, IA e WhatsApp (Kommo, RD Station CRM, Pipedrive; sistemas de OS como Vynix Systems, Seva, OSFlow) | Provar necessidade específica não atendida; não virar "mais um CRM" |
| Concorrente real = WhatsApp Business + planilha + lembretes | Mostrar em reais quanto a empresa perde hoje |
| Dependência das regras do WhatsApp (autorização do destinatário, modelos aprovados, opt-out, tarifas) | Usar só canais oficiais; conferir tabela de preços da Meta no planejamento financeiro |
| Elogio ≠ disposição a pagar | Critério de aprovação baseado em piloto pago, não em opinião |
| Escopo crescer para sistema de gestão completo | Regra 4 e seção 3 |

---

## 5. Portão de Decisão (critérios objetivos)

> Preencha com números reais ao final da Fase 1. Ajuste as metas **antes** de começar as entrevistas, não depois.

| # | Critério | Meta para APROVAR | Resultado | Atingiu? |
|---|---|---|---|---|
| 1 | Empresas entrevistadas no segmento | ≥ 15 | | |
| 2 | Empresas que relatam perder orçamentos por falta de retorno com frequência (semanal ou mais) | ≥ **50%** *(ajustado de 60% — 2026-10-14)* | | |
| 3 | Empresas que conseguem estimar o valor perdido por mês | ≥ 50% | | |
| 4 | Valor recuperável estimado vs. preço-teste **A DEFINIR** | ≥ 10x o preço-teste/mês — ⚠️ **bloqueado**: o preço-teste ainda não foi definido pelo desenvolvedor. O R$ 197/mês que constava aqui era **suposição do agente (copiada do plano Start do Vynix)** e foi removido. Assim que o valor for informado, a meta passa a ser ≥ 10x esse valor. | | |
| 5 | Empresas que NÃO resolvem bem hoje com ferramenta existente | ≥ 50% | | |
| 6 | Pilotos pagos dispostos a assinar (mesmo com preço simbólico) | ≥ 3 | | |
| 7 | Viabilidade do WhatsApp oficial (custo + regras) cabe no preço | Sim | | |
| 8 | Diferencial claro vs. concorrentes (em 1 frase, testado nas entrevistas) | Sim | | |

**Regra de decisão**
- **Seguir:** critérios 1, 6, 7 e 8 atingidos + ao menos 2 dos critérios 2–5.
- **Ajustar:** problema existe, mas há falha em preço, segmento ou diferencial → voltar à seção 3 e repetir a validação.
- **Abandonar:** critério 6 = 0 pilotos após ajuste, ou problema não é frequente.

**Decisão final:** `[ ] Seguir  [ ] Ajustar  [ ] Abandonar` — Data: ____ — Justificativa: ____

---

## 6. Checklist do início ao fim

### FASE 0 — Preparação
- [x] Definir ideia: SaaS de recuperação de orçamentos
- [x] Escolher segmento inicial: ar-condicionado, assistência técnica e manutenção
- [x] Escolher canal principal: WhatsApp
- [x] Definir próximo passo: auditoria e validação, sem implementar
- [x] Escolher o nome do sistema: Radar
- [ ] Checar disponibilidade do nome Radar (domínio .com.br, Registro.br, INPI)
- [x] Definir as metas finais do Portão de Decisão (seção 5) *(ajustes aprovados e aplicados — 2026-10-14)*
- [ ] Criar planilha de acompanhamento das entrevistas

### FASE 1 — Auditoria e validação de mercado (sem código)

**1.1 Demanda**
- [ ] Localizar e salvar a pesquisa do Sebrae (82% usam WhatsApp) com link e data
- [x] Listar as dores a confirmar (orçamento esquecido, cliente some, sem lista do dia, dono não sabe quanto perde, cliente antigo sem contato) *(documentadas no roteiro-entrevista.md — 2026-10-14)*
- [x] Escrever o roteiro de entrevista (perguntas abertas, sem induzir a resposta) *(roteiro-entrevista.md criado com 6 blocos e ficha de registro — 2026-10-14)*

**1.2 Concorrência**
- [x] Mapear CRMs: Kommo, RD Station CRM, Pipedrive (recursos, preço, limitações) *(concorrencia.md seção 1 — 2026-10-14)*
- [x] Mapear sistemas de assistência técnica/OS: Vynix Systems, Seva, OSFlow (recursos, preço, WhatsApp) *(concorrencia.md seção 2 — 2026-10-14)*
- [x] Documentar soluções improvisadas: WhatsApp Business, planilha, agenda *(concorrencia.md seção 3 — 2026-10-14)*
- [x] Montar tabela comparativa e apontar a sobreposição funcional *(concorrencia.md seções 4 e 5 — 2026-10-14)*
- [x] Escrever o diferencial em 1 frase *(concorrencia.md seção 6 — reescrito em 2026-10-14 sem alegação de exclusividade)*
- [x] **Auditar as fontes de concorrência e os custos do arquitetura.md** *(concorrencia.md seção 0 + marcações em arquitetura.md — 2026-10-14)*

**1.3 Viabilidade do WhatsApp**
- [ ] Ler a política oficial (autorização, modelos aprovados, opt-out)
- [!] Consultar a tabela oficial de preços da Meta e estimar custo por cliente *(bloqueado: páginas da Meta inacessíveis em 2026-10-14 — ver concorrencia.md seção 0.7)*
- [ ] Definir se o envio será assistido (vendedor aprova) ou automático

**1.4 Validação comercial**
- [x] Criar modelo de prospecção (tabela + mensagem de WhatsApp + ordem de prioridade) *(prospeccao.md — 2026-10-14; 30 linhas vazias, nada inventado)*
- [~] Listar 30 empresas do segmento (para chegar a 15 entrevistas) *(estrutura pronta em prospeccao.md; lista vazia, aguarda o desenvolvedor preencher)*
- [ ] Fazer contato e agendar conversas
- [ ] Realizar 15 entrevistas
- [x] Registrar em cada entrevista: como registra orçamento, quem faz o retorno, quanto perde, o que usa hoje *(ficha de registro criada em roteiro-entrevista.md — 2026-10-14)*
- [ ] Consolidar padrões e preencher critérios 1–5 do Portão

**1.5 Teste de disposição a pagar**
- [ ] Criar protótipo navegável (sem backend real; ferramenta de design)
- [!] Definir preço-teste do piloto *(bloqueado: o valor precisa vir do desenvolvedor — o R$ 197 usado até aqui era suposição do agente, copiada do Vynix; ver seção 8)*
- [ ] Apresentar o protótipo a cada empresa interessada
- [ ] Propor piloto pago e registrar respostas (sim / não / talvez + motivo)
- [ ] Preencher critério 6 do Portão

**1.6 Decisão**
- [ ] Preencher a tabela do Portão de Decisão (seção 5)
- [ ] Escrever relatório curto de viabilidade (recomendação + motivos)
- [ ] **Decidir: Seguir / Ajustar / Abandonar**

### FASE 2 — Planejamento (só se "Seguir")
- [~] Definir plano completo: produto, arquitetura, custos, fases *(rascunho condicional em arquitetura.md — 2026-10-14)*
- [~] Definir stack técnica compatível com o equipamento disponível *(incluído no arquitetura.md, seção 2)*
- [~] Planejar integração oficial com WhatsApp e custos por mensagem *(incluído no arquitetura.md, seção 5)*
- [ ] Definir modelo de preço e planos
- [~] Definir como medir a receita atribuída (regra de atribuição) *(rascunho no arquitetura.md, seção 4.7 — confirmar com desenvolvedor)*
- [ ] Redigir termos de uso e política de privacidade (LGPD)
- [ ] Definir métricas de sucesso do MVP

### FASE 3 — Construção do MVP
- [x] **Montar estrutura base do monorepo + pipeline de verificação** *(apps/web + apps/api + packages/shared; lint, typecheck, test e build rodando — 2026-10-14, exceção autorizada na seção 8)*
- [ ] Cadastro de empresa e usuário
- [ ] Registro de orçamento (valor, cliente, data de envio, validade)
- [ ] Identificação de orçamentos sem resposta e geração de tarefas
- [ ] Fila diária de follow-up
- [ ] Sugestão de mensagem por IA + aprovação do vendedor
- [ ] Envio via WhatsApp oficial (modelos aprovados, opt-out)
- [ ] Registro de resultado do contato
- [ ] Lembretes de manutenção preventiva
- [~] Painel de retorno financeiro *(primeira tela navegável criada — **demonstrativa, dados fictícios, sem backend real**; 2026-10-14)*
- [ ] Testes (funcionais, mensagens, segurança, LGPD)

### FASE 4 — Piloto
- [ ] Implantar nos 3 pilotos pagos
- [ ] Acompanhar uso semanal
- [ ] Medir: orçamentos acompanhados, recuperados, vendas fechadas, receita atribuída
- [ ] Coletar feedback e corrigir o que mais atrapalha
- [ ] Verificar se a receita recuperada supera a assinatura

### FASE 5 — Lançamento e crescimento
- [ ] Ajustar preço e planos com base no piloto
- [ ] Criar material comercial e estudos de caso reais
- [ ] Definir canal de aquisição (indicação, contabilidades, associações do setor)
- [ ] Configurar cobrança recorrente e suporte
- [ ] Decidir expansão para outros segmentos (oficinas, energia solar, B2B)

---

## 7. Perguntas em aberto

- Qual formato de acompanhamento: só WhatsApp, ou WhatsApp + e-mail + tarefas internas?
- O produto funciona sem integrar com o sistema que a empresa já usa?
- Envio assistido basta, ou o mercado exige automático?

---

## 8. Registro de decisões e evidências

| Data | Tipo | Registro | Fonte |
|---|---|---|---|
| 2026-10-14 | Decisão | Segmento: ar-condicionado/assistência técnica/manutenção; canal: WhatsApp | Usuário |
| 2026-10-14 | Decisão | Fase 1 é só auditoria; nada de implementar | Usuário |
| 2026-10-14 | Decisão | Nome do sistema: Radar | Usuário |
| 2026-10-14 | Rascunho | Rascunho condicional de arquitetura (Fase 2) criado em arquitetura.md — aguarda Portão de Decisão | Agente |
| 2026-10-14 | Pesquisa | Concorrência mapeada: Kommo, RD Station CRM, Pipedrive, Vynix Systems, Seva, OSFlow + soluções improvisadas — salvo em concorrencia.md com fontes e datas | Agente |
| 2026-10-14 | Pesquisa | Diferencial em 1 frase redigido como hipótese (concorrencia.md seção 6) — a testar nas entrevistas | Agente |
| 2026-10-14 | Entregável | Roteiro de entrevista criado (6 blocos, 23 perguntas abertas + ficha de registro) — salvo em roteiro-entrevista.md | Agente |
| 2026-10-14 | Análise | Metas do Portão revisadas — 2 sugestões de ajuste propostas (seção 10 abaixo); aguardam aprovação do desenvolvedor antes de alterar seção 5 | Agente |
| 2026-10-14 | Decisão | Portão critério 2: meta ajustada de ≥ 60% → ≥ 50% (aprovado pelo desenvolvedor) | Usuário |
| 2026-10-14 | **Correção** | O **R$ 197/mês** usado no critério 4 era **suposição do agente**, copiada do plano Start do Vynix Systems — **não foi decisão do desenvolvedor**. Valor removido da seção 5; critério 4 marcado como bloqueado até o preço-teste real ser informado. *(Registro feito antes da informação do novo valor: o pedido do usuário veio com o placeholder `R$ [PREÇO]`, sem número.)* | Usuário + Agente |
| 2026-10-14 | **Pendência** | Desenvolvedor precisa informar o **preço-teste do piloto (R$/mês)**. Com o valor em mãos, o critério 4 vira "≥ 10 × o preço-teste" e a seção 5 é atualizada com a conta. | Agente |
| 2026-10-14 | **Correção** | Frase do diferencial (concorrencia.md seção 6) reescrita: saiu **"O Radar é o único sistema que..."**; entrou **"O Radar foca em recuperar orçamentos parados e medir a receita recuperada, sem substituir o sistema que a empresa já usa."** Motivo: exclusividade não é comprovável enquanto Seva e OSFlow têm itens NÃO CONFIRMADO. | Usuário + Agente |
| 2026-10-14 | Auditoria | **Auditoria de fontes** (concorrencia.md seção 0): páginas oficiais reabertas — Kommo, RD Station CRM, Pipedrive, Vynix, Seva, OSFlow. Preços do **Pipedrive estavam errados** (Growth US$ 24 não US$ 39; Premium US$ 49 não US$ 59; Ultimate US$ 69 não US$ 79–99). **Kommo**: oficial é US$ 20/30/45 por usuário/mês, não a faixa US$ 15–25 gravada. **RD Station CRM**: Basic a partir de R$ 65,70 e Pro a partir de R$ 117,90. **Seva**: 3 planos (R$ 59 / R$ 99 / R$ 199) e IA de estoque confirmada no site. **Vynix**: R$ 197 / 347 / 597 confirmados. | Agente |
| 2026-10-14 | Auditoria | Fontes **inacessíveis** nesta sessão: página de preços da Meta/WhatsApp (000/400/404) e preço por token da OpenAI (página dinâmica). **Custo de WhatsApp e custo de IA continuam NÃO CONFIRMADOS** — nada foi corrigido por suposição. | Agente |
| 2026-10-14 | Auditoria | Câmbio do arquitetura.md: assumido 1 USD = R$ 5,80 → **PTAX do Banco Central de 2026-10-14: venda R$ 5,0441** (compra 5,0435). Marcado como desatualizado; **totais não recalculados** (faltam confirmar IA e tarifa Meta). Fonte: olinda.bcb.gov.br (PTAX). | Agente |
| 2026-10-14 | Entregável | **prospeccao.md criado**: tabela de 30 linhas vazias (nome, cidade, contato, como cheguei, data do contato, status, data da entrevista, observações), ordem de prioridade de contatos e 4 modelos de mensagem de WhatsApp sem venda. Nenhuma empresa inventada. | Agente |
| 2026-10-14 | **Solicitação / Conflito** | Desenvolvedor pediu início da **construção real** (estrutura de app + primeira tela). Isso **colide com a regra 4** (nenhuma implementação antes do Portão de Decisão aprovar) e com o cabeçalho do `arquitetura.md` ("rascunho condicional, só vale se o Portão retornar Seguir"). O Portão **ainda não decidiu** — critérios 1, 3, 5 e 6 vazios; 4 e 7 bloqueados. Nada foi construído; auditoria feita e **decisão devolvida ao desenvolvedor** (opções A/B/C apresentadas). | Usuário + Agente |
| 2026-10-14 | Auditoria técnica | Raiz do projeto: `D:/NoRadar` (5 arquivos .md, **sem git**, sem código). Toolchain: Node v24.18.0 (doc assume 22 LTS), npm 11.8, pnpm 10.18, git 2.53 disponível, **Docker não instalado**, registro npm acessível, portas 3000/3001/5432 livres. | Agente |
| 2026-10-14 | **Exceção autorizada** | Desenvolvedor escolheu a **opção A**: "construção autorizada antes do fechamento do Portão, risco aceito". Fase 1 **continua aberta** e o Portão **não foi aprovado** — critérios 1, 3, 5 e 6 seguem pendentes; 4 e 7 seguem bloqueados. Risco de reversão da estrutura aceito caso as entrevistas indiquem que o produto não deve seguir. | Usuário |
| 2026-10-14 | Decisão técnica | **D1–D5 confirmadas**: monorepo pnpm (`apps/web` + `apps/api` + `packages/shared`); camada de dados mockada atrás da interface `OrcamentoRepository` (sem banco real nesta etapa); dependências instaladas via pnpm com lockfile preservado; git inicializado com `.gitignore`, **sem commits nem publicação remota**; Node 24 como runtime, `engines` documentando `>=24`. | Usuário |
| 2026-10-14 | Entregável | **Estrutura real do monorepo + painel navegável criados.** Stack efetivamente instalada: Next.js 15.5.28, React 19.3.1, Fastify 5.12.7, Tailwind 4.3.3, Zod 4.6.7, TypeScript 5.9.3, Vitest 4.1.11, ESLint 9.39.5, Node v24.18.0, pnpm 10.18.3. Verificação real: `pnpm verificar` (lint + typecheck + test + build) passou — **37 testes** (API 15, Web 22), 0 falhas; `next build` OK. Painel validado em navegador headless (Chrome): renderiza 4 indicadores, tabela fictícia e estados carregando/vazio/erro. | Agente |
| 2026-10-14 | Documentação | Documentos de decisão movidos para `docs/` (NoRadar, arquitetura, concorrencia, prospeccao, roteiro-entrevista) com stubs de redirecionamento na raiz para não quebrar links antigos. `README.md` criado na raiz com comandos testados. **Nenhuma decisão anterior apagada.** | Agente |
| | | | |

---

## 9. Próxima ação

> **Construção inicial concluída (opção A) — o Portão de Decisão continua ABERTO.** Estrutura real do monorepo + painel demonstrativo no ar, testados e auditados. Próximas ações, em ordem:
> 1. **[BLOQUEADO — precisa de você]** Informar o **preço-teste do piloto em R$/mês** (o pedido veio como `R$ [PREÇO]`). Sem o valor, o critério 4 do Portão não é calculável.
> 2. **[Pronto para usar]** Preencher as 30 linhas de `docs/prospeccao.md` com empresas reais e iniciar os contatos.
> 3. **[Pendente]** Localizar e salvar a pesquisa do Sebrae com link e data — item 1.1.
> 4. **[Pendente]** Conseguir a tabela oficial de preços da Meta (página inacessível em 2026-10-14) — critério 7 depende disso.
> 5. **[Decisão sua]** Definir se o próximo incremento de código é a **fila de follow-up** (item Fase 3) ou se o foco volta às **entrevistas** antes de escrever mais código. A regra 5 deste arquivo vale: sem evidência de entrevista, não há como saber se a fila resolve o problema real.

---

## 10. Análise das metas do Portão de Decisão

> ✅ **Ajustes aplicados em 2026-10-14 (aprovados pelo desenvolvedor).**
> ⚠️ **Revisão de 2026-10-14 (2):** o critério 4 foi corrigido — o preço-teste nunca foi escolhido pelo desenvolvedor (ver seção 8). A meta do critério 4 depende do valor real, ainda não informado.

| # | Critério | Meta anterior | Meta aplicada | Status |
|---|---|---|---|---|
| 1 | Empresas entrevistadas | ≥ 15 | ≥ 15 | ✅ Mantida |
| 2 | Relatam perder orçamentos semanalmente | ≥ 60% | ≥ **50%** | ✅ Ajustada |
| 3 | Conseguem estimar valor perdido/mês | ≥ 50% | ≥ 50% | ✅ Mantida |
| 4 | Valor recuperável vs. preço-teste | ≥ 10x (sem preço) | **A DEFINIR** — R$ 197 era suposição do agente, removido | 🔴 Bloqueada (aguarda valor do desenvolvedor) |
| 5 | NÃO resolvem bem com ferramenta atual | ≥ 50% | ≥ 50% | ✅ Mantida |
| 6 | Pilotos pagos dispostos a assinar | ≥ 3 | ≥ 3 | ✅ Mantida |
| 7 | Viabilidade do WhatsApp cabe no preço | Sim | Sim | ✅ Mantida |
| 8 | Diferencial claro testado nas entrevistas | Sim | Sim | ✅ Mantida |

