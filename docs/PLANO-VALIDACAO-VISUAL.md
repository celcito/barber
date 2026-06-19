# Plano — Validação Visual + Garantia de Persistência (Painel da Barbearia)

**Data**: 2026-06-17
**Escopo aprovado**: Fase 1 + 2 (validação + dados). Foto do profissional auditada antes. Agenda: mostrar todos os slots.

---

## Contexto da Auditoria

Após mapear o repositório, foi identificado que o painel da barbearia (Configurações, Serviços, Profissionais, Agenda) tem validação no backend (Zod) mas feedback visual insuficiente na tela. Há ainda pontos a garantir que dados chegam ao banco (filtro restritivo da agenda, sanitização de entrada pt-BR).

**Mudanças já aplicadas no disco (não commitadas)**:
- `app/dashboard/configuracoes/page.tsx` — controles passam a `value` + `onChange`, banner de erros adicionado
- `lib/actions/salao.ts` — `formData.has(...)` para booleanos, `revalidatePath("/"+slug)`
- `lib/schemas/salao.ts` — regex do WhatsApp relaxado
- `tests/configuracoes.spec.ts` + `playwright.config.ts` + `tests/auth.setup.ts` — setup E2E
- `app/api/dev/test-slug/route.ts` — rota de debug

---

## Tasks

### AUD — Auditar `AvatarPicker` e fluxo de upload de foto
- ✅ `AvatarPicker` tem hidden input `name="foto_url"` com `value={finalUrl}` → OK
- ✅ Rota `/api/upload-avatar` chama `uploadAvatar()` no server → OK
- **Saída**: OK, sem necessidade de fixes

### T1. Erros inline nos inputs de Configurações (nome, slug, whatsapp) ✅
- `app/dashboard/configuracoes/page.tsx`
- Adicionados `<p>` de erro inline abaixo de nome, slug e whatsapp
- Não conflita com `pattern` HTML5

### T2. Banner de erros + verificação do `Input` em Serviços ✅
- `components/features/servico-form.tsx` — banner agregado (bg-error/10 + border-error/30) no topo
- `components/ui/input.tsx` já renderiza `error` prop em vermelho (linha 55-59)

### T3. Banner de erros + erro inline de foto em Profissionais ✅
- `components/features/profissional-form.tsx` — banner agregado + erro `foto_url` abaixo do `AvatarPicker`

### T4. Sanitização de preço (serviço) e WhatsApp (config) ✅
- `lib/schemas/servico.ts:6` — `z.string().transform(v => Number(v.replace(",", "."))).pipe(z.number().min(...))`
- `lib/schemas/salao.ts:10` — `.trim()` adicionado ao whatsapp

### T5. Corrigir filtro restritivo da agenda (mostrar todos os slots) ✅
- `app/dashboard/agenda/page.tsx` — filtro `horaNum >= horaAtual` removido
- Contadores adicionados no header: "N confirmados · N pendentes · N cancelados"

### T6. Validação final ✅
- `npm run build` → 0 erros

---

## Critérios de Pronto

- [x] Inputs de Configurações mostram erro inline quando Zod falha
- [x] Form de Serviços tem banner agregado + input vermelho quando há erro
- [x] Form de Profissionais tem banner agregado + erro de foto
- [x] Preço aceita `45,00` e `45.00`
- [x] WhatsApp com espaços extras não quebra
- [x] Agenda mostra todos os slots de dias passados/futuros
- [x] `npm run build` passa limpo
- [x] Relatório da auditoria de AvatarPicker entregue

---

## Arquivos a modificar (estimativa)

| Arquivo | Linhas estimadas |
|---|---|
| `app/dashboard/configuracoes/page.tsx` | +12 (3 blocos de erro inline) |
| `components/features/servico-form.tsx` | +8 (banner) |
| `components/features/profissional-form.tsx` | +10 (banner + erro foto) |
| `lib/schemas/servico.ts` | +1 (transform) |
| `lib/schemas/salao.ts` | +1 (trim) |
| `app/dashboard/agenda/page.tsx` | -4 (remove filtro) +10 (contadores) |

**Total**: ~6 arquivos, ~40 linhas líquidas.
