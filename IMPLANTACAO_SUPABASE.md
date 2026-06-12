# Plano de Implantação — Supabase (Remover Mocks)

## Status atual

| Módulo | Supabase | Mock |
|--------|----------|------|
| Serviços (CRUD) | ✅ | ❌ |
| Profissionais (CRUD) | ✅ | ❌ |
| Agendamentos (CRUD) | ✅ | ❌ |
| Agenda semanal | ✅ | ❌ |
| Exceções de horário | ✅ | ❌ |
| Configurações do salão | ✅ | ❌ |
| Booking público (fluxo) | ✅ | ❌ |
| Lista de clientes | ✅ | ❌ |
| Auth + avatar upload | ✅ | ❌ |
| Dashboard — KPIs | ✅ | ❌ |
| Dashboard — Lista agendamentos | ✅ | ❌ |
| Dashboard — Equipe em serviço | ✅ | ❌ |
| Login — credenciais de teste | ✅ | ❌ |
| Landing page (marketing) | — | estático (proposital) |
| Config — valores default | — | fallback (proposital) |

---

## Task 1 — Dashboard: KPIs dinâmicos

**Arquivo:** `app/dashboard/page.tsx`

**O que substituir:**
- `18` (agendamentos hoje, linha 67) → `agendamentosHoje.length`
- `R$ 2.450` (receita estimada, linha 72) → `agendamentosHoje.reduce((acc, a) => acc + (a.servicos?.preco ?? 0), 0)`
- `05` (clientes novos, linha 77) → query adicional: clientes únicos com `criado_em` no mês atual

---

## Task 2 — Dashboard: Lista de agendamentos reais

**Arquivo:** `app/dashboard/page.tsx`

**O que substituir:**
- `agendamentosMock` (linhas 48-52) → `agendamentosHoje` (já consultado na linha 33, mas não usado)
- Adaptar template JSX para campos: `cliente_nome`, `inicio` (formatar para HH:mm), `servicos.nome`, `servicos.duracao_min`

---

## Task 3 — Dashboard: Equipe em Serviço dinâmica

**Arquivo:** `app/dashboard/page.tsx`

**O que substituir:**
- Julian Rossi / Arthur Vance hardcoded (linhas 104-121) → `profissionaisResult.data` (já consultado na linha 42)
- Adicionar `foto_url` ao select da query de profissionais
- Imagem fallback com avatar initials se não houver foto

---

## Task 4 — Login: Credenciais de teste só em dev

**Arquivo:** `app/login/page.tsx`

**O que substituir:**
- Seção de credenciais de teste (linhas 140-144) → envolver em `process.env.NODE_ENV === 'development'`
