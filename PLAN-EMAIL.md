# Plano: Configurar Serviço de Email Gratuito (Resend)

## Objetivo
Configurar o serviço Resend (tier gratuito: 3.000 emails/mês) para envio automático de emails de confirmação, lembrete e cancelamento de agendamentos.

## Domínio de Teste
- **Remetente:** `Agenda Fácil <onboarding@resend.dev>`
- **Para produção:** Configurar domínio próprio no Resend

## Design de Referência
- **Stitch:** Projeto "barbearia" - Template "Template de E-mail - Confirmação de Agendamento"
- **Design System:** Heritage & Steel (Vintage Industrial)
- **Fontes:** Playfair Display (headlines) + Hanken Grotesk (body)
- **Cores:** Primary `#c5a059` (aged gold), Surface `#121414` (charcoal), Outline `#9a8f80`

---

## Arquivos (10)

### Novos (4)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `lib/email.ts` | Cliente Resend + funções de envio genéricas |
| 2 | `lib/emails/confirmation.tsx` | Template React Email - Confirmação de Agendamento |
| 3 | `lib/emails/reminder.tsx` | Template React Email - Lembrete |
| 4 | `lib/emails/cancellation.tsx` | Template React Email - Cancelamento |

### Modificados (6)

| # | Arquivo | Mudança |
|---|---------|---------|
| 5 | `lib/actions/public.ts` | Adicionar `sendConfirmationEmail()` na linha ~370 (após WhatsApp) |
| 6 | `lib/actions/agendamentos.ts` | Adicionar envio em `createAgendamentoAdmin()` (linha ~373) e `cancelarAgendamento()` (linha ~15) |
| 7 | `supabase/functions/send-reminders/index.ts` | Adicionar envio de lembrete por email quando `lembretes_email_ativos` |
| 8 | `.env.example` | Adicionar `RESEND_API_KEY`, `RESEND_FROM`, `NEXT_PUBLIC_APP_URL` |
| 9 | `.env.local` | Adicionar valores de teste |
| 10 | `package.json` | Adicionar dependências `resend`, `@react-email/components`, `@react-email/render` |

---

## Dependências

```bash
npm install resend @react-email/components @react-email/render
```

## Variáveis de Ambiente

```env
# Resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM=Agenda Fácil <onboarding@resend.dev>

# App URL (para links no email)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Estrutura do Módulo de Email

### `lib/email.ts`
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactNode;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to,
    subject,
    react,
  });
}

// Funções específicas
export async function sendConfirmationEmail(params) { ... }
export async function sendReminderEmail(params) { ... }
export async function sendCancellationEmail(params) { ... }
```

### Templates React Email
Cada template converte o design do Stitch para inline CSS (compatível com clientes de email):
- Header com nome do salão (dinâmico)
- Saudação personalizada com nome do cliente
- Card de detalhes: serviço, barbeiro, data/horário, endereço
- Botão CTA (Adicionar ao Calendário no template de confirmação)
- Footer com dados do salão

---

## Fluxos de Envio

### 1. Confirmação de Agendamento
- **Trigger:** Criação de agendamento (público via `lib/actions/public.ts` ou admin via `lib/actions/agendamentos.ts`)
- **Destinatário:** Cliente (se informou email no formulário)
- **Assunto:** `✅ Agendamento Confirmado!`
- **Condição:** `cliente_email` não é null/vazio

### 2. Lembrete
- **Trigger:** Edge function `send-reminders` (cron job)
- **Destinatário:** Cliente (se `lembretes_email_ativos = true` na config do salão + `cliente_email` existe)
- **Assunto:** `⏰ Lembrete do seu horário`
- **Condição:** `notifConfig.lembretes_email_ativos && agendamento.cliente_email`

### 3. Cancelamento
- **Trigger:** Admin cancela agendamento via `cancelarAgendamento()` em `lib/actions/agendamentos.ts`
- **Destinatário:** Cliente (se tem email no agendamento)
- **Assunto:** `❌ Agendamento Cancelado`
- **Condição:** Buscar dados do agendamento antes de cancelar, enviar se `cliente_email` existe

---

## Integração com Server Actions

### `lib/actions/public.ts` - `createAgendamento()`
Após linha 370 (após envio de WhatsApp):
```typescript
// Envio de email de confirmação
if (parsed.data.email) {
  sendConfirmationEmail({
    to: parsed.data.email,
    clienteNome: parsed.data.nome,
    servicoNome: servico.nome,
    profissionalNome,
    data: dataFormatada,
    horario: horarioFormatado,
    salaoNome: salao?.nome || 'Salão',
  }).catch(err => console.error('[Email] Send error:', err));
}
```

### `lib/actions/agendamentos.ts` - `createAgendamentoAdmin()`
Após linha 373 (após envio de WhatsApp):
```typescript
if (parsed.data.email) {
  sendConfirmationEmail({ ... }).catch(err => 
    console.error('[Email] Send error:', err)
  );
}
```

### `lib/actions/agendamentos.ts` - `cancelarAgendamento()`
Antes de atualizar status, buscar dados e enviar:
```typescript
const { data: agendamento } = await supabase
  .from('agendamentos')
  .select('cliente_nome, cliente_email, servico_id, profissional_id, inicio')
  .eq('id', id)
  .single();

// ... buscar servico, profissional, salao ...

if (agendamento?.cliente_email) {
  await sendCancellationEmail({ to: agendamento.cliente_email, ... });
}
```

### Edge Function `send-reminders`
No loop de agendamentos, após enviar WhatsApp:
```typescript
// Envio de lembrete por email
if (notifConfig.lembretes_email_ativos && agendamento.cliente_email) {
  await sendReminderEmail({
    to: agendamento.cliente_email,
    clienteNome: agendamento.cliente_nome,
    servicoNome: servico?.nome || 'Serviço',
    data: dataFormatada,
    horario: horarioFormatado,
    salaoNome: salao?.nome || 'Salão',
  });
}
```

---

## Notas
- Todos os envios são non-blocking (Promise.all com .catch) para não afetar a experiência do usuário
- Templates usam inline CSS para compatibilidade com Gmail, Outlook, etc.
- O campo `cliente_email` já existe na tabela `agendamentos` e já é coletado nos formulários
- O toggle `lembretes_email_ativos` já existe na UI de configurações, apenas precisa ser consumido
