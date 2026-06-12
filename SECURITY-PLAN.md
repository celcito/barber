# 🔒 Plano de Segurança — AgendaFacil

**Data:** 2026-06-12
**Projeto:** Next.js 14 + Supabase — Barbearia/Salão de agendamento

---

## 🚨 CRÍTICO (Ação Imediata)

| # | Item | Arquivo | Descrição |
|---|------|---------|-----------|
| 1 | Rotacionar credenciais expostas | `.env.local` | Chaves Supabase, Resend API estão no repositório. Se já foram commitadas, rotacionar todas. |
| 2 | Token Z-API na URL | `lib/zapi.ts:24` | Token aparece em logs de acesso. Mover para header de autenticação. |

---

## 🔴 ALTO

| # | Item | Arquivo(s) | Solução Proposta |
|---|------|------------|------------------|
| 3 | Sem proteção CSRF | Todas as server actions e API routes | Implementar CSRF tokens (Next.js built-in ou biblioteca) |
| 4 | Open Redirect no auth callback | `app/auth/callback/route.ts:7,10` | Validar parâmetro `next` com whitelist de paths permitidos |
| 5 | INSERT público em agendamentos | `migration.sql:125` | Restringir política RLS — exigir `salao_id` válido existente |
| 6 | Sem rate limiting | Todas as API routes | Adicionar rate limiting (ex: `@upstash/ratelimit`) especialmente no booking público |
| 7 | Logout via GET | `app/auth/logout/route.ts:4` | Mudar para POST com proteção CSRF |

---

## 🟡 MÉDIO

| # | Item | Arquivo(s) | Solução Proposta |
|---|------|------------|------------------|
| 8 | Headers de segurança ausentes | `next.config.mjs` | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| 9 | Sem CORS configurado | `next.config.mjs` | Definir origins permitidas para API routes |
| 10 | Validação incompleta nos FormData | `lib/actions/public.ts`, `horario-excessoes.ts`, `upload.ts` | Adicionar schemas Zod completos para todos os campos |
| 11 | Upload de arquivo bypassável | `lib/actions/upload.ts:14-16` | Validar magic bytes, não apenas MIME type |
| 12 | Injeção HTML em emails | `send-reminders/index.ts:45-97` | Escapar dados do cliente no template HTML |
| 13 | Injeção de filtros PostgREST | `lib/actions/public.ts:112-116` | Sanitizar parâmetros antes de interpolá-los |
| 14 | Recursão infinita no retry Z-API | `lib/zapi.ts:36-38` | Adicionar limite de retentativas (max 3) |
| 15 | Erros expõem detalhes internos | `app/error.tsx:16`, various actions | Mensagens genéricas ao cliente, log detalhado no servidor |
| 16 | Auth inconsistente | Múltiplos arquivos em `lib/actions/` | Criar middleware unificado de verificação de auth |
| 17 | Middleware não cobre API routes | `middleware.ts:63-65` | Adicionar `/api/:path*` ao matcher |
| 18 | Senhas fracas permitidas | `supabase/config.toml:181-185` | Aumentar mínimo para 8 chars + complexidade |
| 19 | Confirmação de email desabilitada | `supabase/config.toml:226` | Habilitar `enable_confirmations = true` |
| 20 | Admin client bypassa RLS | `lib/supabase/server.ts:25-43` | Remover ou restringir uso do `createAdminClient` |
| 21 | Queries pesadas sem auth | `app/api/horarios/route.ts:1-22` | Verificar auth antes de executar queries pesadas |

---

## 🟢 BAIXO

| # | Item | Arquivo(s) | Solução Proposta |
|---|------|------------|------------------|
| 22 | Credenciais de teste na página de login | `app/login/page.tsx:138-146` | Remover em produção |
| 23 | Sem lockout de conta após tentativas | `supabase/config.toml:207` | Configurar no Supabase |
| 24 | `!` em variáveis de ambiente | `lib/stripe.ts:3` | Validação com fallback |
| 25 | Dados completos em respostas API | `lib/actions/public.ts:386` | Retornar apenas campos necessários |
| 26 | TLS desabilitado (config local) | `supabase/config.toml:26-31` | Habilitar para produção |
| 27 | HTTP na URL do app | `.env.example:21` | Usar HTTPS em produção |
| 28 | Sem framework de audit logging | Global | Adicionar logging estruturado |

---

## 📋 Ordem de Execução Recomendada

1. **Fase 1 — Emergência**: Rotacionar credenciais (1-2)
2. **Fase 2 — Crítico**: CSRF, Open Redirect, RLS, Rate Limiting, Logout (3-7)
3. **Fase 3 — Hardening**: Headers, CORS, Validação, Upload (8-13)
4. **Fase 4 — Refinamento**: Retry limits, Error handling, Auth unificado (14-21)
5. **Fase 5 — Low priority**: Itens restantes (22-28)
