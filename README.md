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

## Configuração de variáveis de ambiente

Preencha `.env.local` com os valores do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

> `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são usados pelo cliente do Supabase no navegador e no servidor.
> `SUPABASE_SERVICE_KEY` é uma chave secreta usada somente no servidor.

## MCP Stitch

A configuração do MCP do Google Stitch (para design de screens via IA) está em `~/.config/opencode/opencode.jsonc`. É um MCP remoto que aponta para `https://stitch.googleapis.com/mcp` e requer a variável de ambiente `GOOGLE_STITCH_API_KEY` com a chave da API.
