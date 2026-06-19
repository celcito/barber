# Implantação Supabase — Barbearia

## Projeto ativo
- **URL:** `https://tlggkdrlijxxvnpaokrc.supabase.co`
- **Project ref:** `tlggkdrlijxxvnpaokrc`
- **Região:** West US (Oregon)

## Setup local

```bash
# 1. Copie o .env.example e preencha
cp .env.example .env.local

# 2. Login no Supabase CLI
supabase login

# 3. Link ao projeto remoto
supabase link --project-ref tlggkdrlijxxvnpaokrc --password '<db-password>'

# 4. Aplique as migrations
supabase db push

# 5. Popule com dados de teste
node scripts/seed.mjs
```

## Credenciais de teste (após seed)

- **Email:** `teste@barbearia.com`
- **Senha:** `123456`
- **Slug:** `/barbearia-teste`

## Migrations

| Arquivo | Conteúdo |
|---------|----------|
| `20250616_full_schema.sql` | Schema completo (tabelas, RLS, trigger `handle_new_user`) |
| `20250618_profissionais_foto_url.sql` | Coluna `foto_url` em profissionais |

## Como funciona a seed

O usuário `postgres` do Supabase **não tem permissão** para:
- `INSERT/DELETE/TRUNCATE` em `auth.users`
- `ALTER TRIGGER` em `auth.users`

Por isso a seed SQL tradicional não funciona. A solução em `scripts/seed.mjs`:

1. Usa a **service role key** (bypassa RLS) para excluir dados de teste existentes
2. Cria o usuário via `auth.admin.createUser` (o trigger `handle_new_user` cria o salão)
3. Atualiza o salão com nome/slug/config customizados
4. Substitui profissionais e horários
5. Mantém os serviços padrão (criados pelo trigger)
6. Insere agendamentos de exemplo

## Reset total

Se o banco ficar inconsistente:

```sql
-- 1. Rode supabase/reset.sql no SQL Editor
-- 2. Crie uma conta nova via /cadastro
-- 3. Trigger cria salão automaticamente
```

Ou via CLI:
```bash
node scripts/seed.mjs  # limpa e recria
```

## Validação E2E

```bash
# 1. Servidor dev
npm run dev

# 2. Fluxos a testar manualmente
# - http://localhost:3000/login (teste@barbearia.com / 123456)
# - http://localhost:3000/dashboard (KPIs, equipe, próximos)
# - http://localhost:3000/dashboard/agenda
# - http://localhost:3000/dashboard/profissionais
# - http://localhost:3000/dashboard/servicos
# - http://localhost:3000/dashboard/configuracoes
# - http://localhost:3000/barbearia-teste (fluxo público)
```
