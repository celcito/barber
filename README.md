# AgendaFácil

Sistema de agendamento online para barbearias e salões.

## Como agendar um horário

Acesse o link público da barbearia:
- **Produção:** `https://agendafacil.com.br/{slug}`
- **Desenvolvimento Local:** `http://localhost:3000/{slug}` (ex: `http://localhost:3000/barbearia-teste`)

O fluxo tem 4 etapas:

1. **Escolher serviço** — selecione o serviço desejado (corte, barba, etc.)
2. **Escolher profissional** — ou selecione "Sem preferência"
3. **Escolher data e horário** — navegue pelo calendário e escolha um horário disponível
4. **Dados do cliente** — informe nome e WhatsApp

Após confirmar, você recebe uma mensagem de confirmação no WhatsApp e pode adicionar o compromisso ao Google Agenda.

## Para o dono da barbearia

1. Faça login em:
   - **Local:** `http://localhost:3000/dashboard`
   - **Produção:** `https://agendafacil.com.br/dashboard`
2. Cadastre os **serviços** (nome, duração, preço)
3. Cadastre os **profissionais**
4. Configure os **horários de funcionamento** em Configurações
5. Compartilhe o link de agendamento (`{slug}`) com seus clientes

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Banco de dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Pagamentos:** Stripe
- **Notificações:** Z-API (WhatsApp)

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver o resultado.

## Arquitetura Multi-Tenant

### Relacionamento de Tabelas

```
auth.users (id = tenant_id)
    └── saloes (id = auth.uid) -- 1 salão por usuário (via trigger)
            └── salao_admins -- múltiplos admins por salão
                    ├── profissionais
                    ├── servicos
                    ├── agendamentos
                    └── horario_excessoes
```

### Tabela salao_admins

Permite vincular múltiplos administradores a um salão:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| salao_id | UUID | FK para saloes (tenant_id) |
| user_id | UUID | FK para auth.users |
| role | TEXT | 'admin' ou 'owner' |
| criado_em | TIMESTAMPTZ | Data de criação |

### Políticas RLS

Todas as tabelas verificam acesso via função `is_salao_admin(salao_id)`:
- SELECT público: apenas salões com `ativo = true`
- INSERT/UPDATE/DELETE: apenas admins do salão

## Schema do Banco

### Tabelas Principais

- **saloes** — informações do salão (nome, slug, whatsapp, config)
- **salao_admins** — admins vinculados a cada salão
- **profissionais** — profissionais do salão
- **profissional_horarios** — horários de trabalho por dia
- **servicos** — serviços oferecidos (corte, barba, etc.)
- **agendamentos** — agendamentos feitos pelos clientes
- **horario_excessoes** — exceções de horário (feriados, etc.)

### Slug de Agendamento

O link público de agendamento é baseado no campo `slug` da tabela `saloes`:
- URL: `https://agendafacil.com.br/{slug}`
- Exemplo: `https://agendafacil.com.br/barbearia-teste`

O slug é único e deve conter apenas letras minúsculas, números e hífens.

## MCP Stitch

A configuração do MCP do Google Stitch (para design de screens via IA) está em `~/.config/opencode/opencode.jsonc`. É um MCP remoto que aponta para `https://stitch.googleapis.com/mcp` e requer a variável de ambiente `GOOGLE_STITCH_API_KEY` com a chave da API.

## Setup do banco (Supabase)

```bash
supabase login
supabase link --project-ref tlggkdrlijxxvnpaokrc
supabase db push
node scripts/seed.mjs
```

Mais detalhes em `IMPLANTACAO_SUPABASE.md`.