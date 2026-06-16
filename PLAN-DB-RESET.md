# Plano: Limpeza do Banco + Schema Único + Seed

## Problema

Conflito de IDs ao cadastrar usuários e horários. Causas:

1. **Trigger `handle_new_user()` + seed.sql**: O seed insere em `auth.users` com UUID fixo → trigger cria `saloes` com `id = NEW.id` → conflito se o UUID já existe
2. **Schema duplicado**: O schema completo existe em 2 lugares (`lib/supabase/migration.sql` + `supabase/migrations/`) causando objetos duplicados
3. **Sem DROP IF EXISTS**: Re-executar migrations quebra tudo

## Arquivos a modificar

### Criar: `supabase/migrations/20250616_full_schema.sql`

Migration única completa com:

- `DROP` de todas as tabelas, enums, funções, triggers (com IF EXISTS)
- Recriação limpa de:
  - `saloes` (UUID PK = auth.users.id)
  - `profissionais` (FK → saloes, CASCADE)
  - `profissional_horarios` (FK → profissionais, CASCADE, UNIQUE profissional_id + dia_semana)
  - `servicos` (FK → saloes, CASCADE)
  - `agendamentos` (FK → saloes/profissionais/servicos, com cliente_email já incluso)
  - `horario_excessoes` (FK → saloes, CASCADE)
- Enum `agendamento_status` ('confirmado', 'pendente', 'cancelado')
- Todos os índices
- Todas as políticas RLS (admin own-data + public SELECT/INSERT para booking)
- Função `handle_new_user()` com `CREATE OR REPLACE`
- Trigger `on_auth_user_created`

### Reescrever: `supabase/seed.sql`

- Usar `DO $$ ... $$` block com variáveis para UUIDs dinâmicos
- Criar usuário de teste `teste@agendafacil.com.br` (senha: Teste123!)
- Trigger cria automaticamente: salão, profissional, horários, serviços
- Dados extras: 2 barbeiros, horários customizados, alguns agendamentos de exemplo

### Deletar migrations antigas:
- `supabase/migrations/20250612_profissional_horarios.sql`
- `supabase/migrations/20250612_add_cliente_email.sql`
- `supabase/migrations/20250614_seed_default_user_data.sql`

### Deletar schema duplicado:
- `lib/supabase/migration.sql`

### Criar: `supabase/setup.sh`

Script de setup de uma linha:
```bash
#!/bin/bash
supabase db reset
```

## Como instalar do zero

### Supabase local:
```bash
supabase start
supabase db reset
```

### Supabase cloud:
1. Colar SQL da migration no SQL Editor
2. Executar `seed.sql` no SQL Editor

### Credenciais de teste:
- Email: `teste@agendafacil.com.br`
- Senha: `Teste123!`
