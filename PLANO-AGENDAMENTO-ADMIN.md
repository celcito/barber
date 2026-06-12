# Plano: Agendamento pelo Admin com campo E-mail

## Status: ✅ IMPLEMENTADO

## Objetivo
Habilitar que o profissional/admin agende para o cliente através de uma página dedicada com wizard de 5 passos, incluindo campo de e-mail opcional.

## Pré-requisito: Migration SQL
A tabela `agendamentos` não possui campo `cliente_email`. Criar migration:

```sql
ALTER TABLE agendamentos
ADD COLUMN cliente_email TEXT DEFAULT NULL;
```

> ⚠️ **Executar a migration no Supabase SQL Editor antes de usar.**
> Arquivo: `supabase/migrations/20250612_add_cliente_email.sql`

## Arquivos a modificar/criar

| # | Ação | Arquivo | Status |
|---|------|---------|--------|
| 0 | Migration SQL | `supabase/migrations/20250612_add_cliente_email.sql` | ✅ |
| 1 | Atualizar tipos | `types/database.ts` — adicionar `cliente_email` | ✅ |
| 2 | Atualizar schema | `lib/schemas/agendamento.ts` — adicionar `adminAgendamentoSchema` | ✅ |
| 3 | Server actions admin | `lib/actions/agendamentos.ts` — criar `createAgendamentoAdmin`, `getServicosAdmin`, `getProfissionaisAdmin`, `getHorariosDisponiveisAdmin` | ✅ |
| 4 | Componente wizard | `components/features/admin-booking-form.tsx` | ✅ |
| 5 | Página dedicada | `app/dashboard/agenda/novo/page.tsx` | ✅ |
| 6 | Ativar botão sidebar | `components/dashboard/sidebar.tsx` | ✅ |
| 7 | API horários | `app/api/horarios/route.ts` | ✅ (extra) |

## Detalhamento

### 0. Migration SQL
- Adicionar coluna `cliente_email TEXT DEFAULT NULL` na tabela `agendamentos`
- Arquivo criado em `supabase/migrations/20250612_add_cliente_email.sql`

### 1. Tipos (`types/database.ts`)
- Adicionar `cliente_email: string | null` em `Row`, `Insert` e `Update` de `agendamentos`

### 2. Schema (`lib/schemas/agendamento.ts`)
- Criar `adminAgendamentoSchema` com campos:
  - `nome` (obrigatório)
  - `whatsapp` (obrigatório, regex)
  - `email` (opcional, validação de formato)

### 3. Server Actions (`lib/actions/agendamentos.ts`)
- `getServicosAdmin()` — busca serviços do salão autenticado
- `getProfissionaisAdmin()` — busca profissionais ativos do salão
- `getHorariosDisponiveisAdmin()` — calcula horários livres (reutiliza lógica de `public.ts`)
- `createAgendamentoAdmin(formData)` que:
  - Verifica autenticação via `getAuthUser()`
  - Valida dados com `adminAgendamentoSchema`
  - Verifica conflitos de horário
  - Insere agendamento com `cliente_email`
  - Status `"confirmado"`
  - Envia WhatsApp ao cliente e dono
  - Revalida cache

### 4. Componente Wizard (`components/features/admin-booking-form.tsx`)
- 5 passos: Serviço → Profissional → Data → Horário → Dados do Cliente
- Step 5: campos Nome, WhatsApp e **E-mail** (opcional)
- Chamar `createAgendamentoAdmin` no submit

### 5. Página (`app/dashboard/agenda/novo/page.tsx`)
- Busca serviços e profissionais do salão autenticado
- Renderiza `<AdminBookingForm>`

### 6. Sidebar (`components/dashboard/sidebar.tsx`)
- Botão "Novo Agendamento" com `onClick` que navega para `/dashboard/agenda/novo`

### 7. API Route (`app/api/horarios/route.ts`)
- Endpoint POST que retorna horários disponíveis para uma data/serviço/profissional

## Fluxo
```
Admin clica "Novo Agendamento"
  → /dashboard/agenda/novo
  → Wizard: Serviço → Profissional → Data → Horário → Dados do Cliente
  → Step 5: admin digita nome, WhatsApp e e-mail do cliente
  → Submit → createAgendamentoAdmin()
  → Redireciona para /dashboard/agenda
```
