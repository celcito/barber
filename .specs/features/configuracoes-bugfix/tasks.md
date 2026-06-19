# Configuracoes Bugfix — Tasks

**Spec**: `.specs/features/configuracoes-bugfix/spec.md`
**Status**: Draft

---

## Execution Plan

```
T1 → T2 → T3 → T4 → T5
```

### Phase 1: Bugfixes (Sequential)

```
T1 (fix checkbox pattern) → T2 (fix nome/slug + exibir erros) → T3 (fix endereco/redes/whatsapp)
```

### Phase 2: Testes (Sequential)

```
T3 → T4 (Playwright setup) → T5 (E2E tests)
```

---

## Task Breakdown

### T1: Remover hidden inputs dos checkboxes

**What**: Remover `<input type="hidden">` que precedem checkboxes. Trocar server action para usar `formData.has()`.

**Where**:
- `app/dashboard/configuracoes/page.tsx` — remover hidden inputs: linha ~282 (horario), ~459 (notificar_dono), ~573 (lembretes_ativos), ~587 (lembretes_email_ativos)
- `lib/actions/salao.ts` — trocar `formData.get("...") === "true"` por `formData.has("...")` nas linhas ~45, ~84, ~85, ~88

**Depends on**: None
**Requirement**: CONF-01, CONF-02

**Done when**:
- [ ] Hidden inputs removidos dos 4 grupos
- [ ] Server action usa `formData.has()` para booleanos
- [ ] `npm run build` passa

**Tests**: none
**Gate**: build

---

### T2: Corrigir nome/slug + exibir erros de validacao no form

**What**: Investigar por que nome e slug nao salvam (provalvel: validacao Zod falha sem feedback). Adicionar exibicao de `errors.nome`, `errors.slug`, `errors.whatsapp`, `errors._form` no template.

**Where**:
- `app/dashboard/configuracoes/page.tsx` — adicionar `<p className="text-error">` apos inputs de nome, slug, whatsapp
- `lib/actions/salao.ts` — adicionar `console.error` para debug; garantir que erros de unicidade do slug sao retornados
- `lib/schemas/salao.ts` — revisar regex do slug e whatsapp

**Depends on**: T1
**Requirement**: CONF-03, CONF-05

**Done when**:
- [ ] Nome salva e persiste apos reload
- [ ] Slug salva e persiste apos reload
- [ ] Erros de validacao aparecem abaixo dos inputs
- [ ] `npm run build` passa

**Tests**: none
**Gate**: build

---

### T3: Verificar endereco, redes sociais, whatsapp, intervalo

**What**: Garantir que endereco, redes sociais, whatsapp e intervalo salvam corretamente. Estes campos usam text inputs (nao checkboxes), entao devem funcionar, mas verificar se ha erros na montagem do JSONB.

**Where**:
- `lib/actions/salao.ts` — revisar montagem dos objetos `endereco`, `redes_sociais`, `configFinal`
- `app/dashboard/configuracoes/page.tsx` — verificar se `defaultValue` esta sendo populado corretamente

**Depends on**: T2
**Requirement**: CONF-04

**Done when**:
- [ ] Endereco persiste apos reload
- [ ] Redes sociais persistem apos reload
- [ ] WhatsApp persiste apos reload
- [ ] Intervalo persiste apos reload
- [ ] `npm run build` passa

**Tests**: none
**Gate**: build

---

### T4: Instalar e configurar Playwright

**What**: Instalar `@playwright/test`, criar `playwright.config.ts`, configurar webServer apontando para `npm run dev`, criar auth helper para login via Supabase.

**Where**:
- `package.json` — adicionar `@playwright/test` em devDependencies
- `playwright.config.ts` — raiz do projeto
- `tests/auth.setup.ts` — fixture de autenticacao

**Depends on**: T3
**Requirement**: CONF-06

**Done when**:
- [ ] `npx playwright install chromium` funciona
- [ ] `playwright.config.ts` configurado com `baseURL: http://localhost:3000`
- [ ] Auth fixture consegue logar como teste@barbearia.com

**Tests**: none
**Gate**: build

---

### T5: Criar E2E tests para configuracoes

**What**: Suite de testes Playwright cobrindo todas as secoes da pagina de configuracoes.

**Where**: `tests/configuracoes.spec.ts`

**Depends on**: T4
**Requirement**: CONF-07

**Cenarios**:
1. Login → Config → Alterar nome → Salvar → Reload → Nome persiste
2. Login → Config → Alterar slug → Salvar → Reload → Slug persiste
3. Login → Config → Marcar "Aberto" domingo → Salvar → Reload → Checkbox marcado
4. Login → Config → Desmarcar "Aberto" segunda → Salvar → Reload → Checkbox desmarcado
5. Login → Config → Preencher endereco completo → Salvar → Reload → Endereco persiste
6. Login → Config → Preencher Instagram + Facebook → Salvar → Reload → Redes persistem
7. Login → Config → Ativar "Notificar dono" + "Lembretes WhatsApp" → Salvar → Reload → Toggles ativos
8. Login → Config → Alterar intervalo para 45min → Salvar → Valor persiste

**Done when**:
- [ ] Todos os 8 cenarios passam
- [ ] `npx playwright test` retorna 0 erros
- [ ] Testes validam persistencia (reload + verificar)

**Tests**: e2e
**Gate**: full

---

### T6: Corrigir regex WhatsApp + revalidar pagina publica

**What**: O regex do WhatsApp so aceita `(99) 99999-9999`, mas o placeholder mostra `+55 (11) 99999-9999`. Quando o usuario tem um numero com `+55`, a validacao Zod inteira falha — nome e slug nunca salvam. Adicionar `revalidatePath` para a pagina publica do slug.

**Where**:
- `lib/schemas/salao.ts` — linha 10: regex do whatsapp
- `lib/actions/salao.ts` — linha 35: fallback `|| ""` no formData, linha 106: `revalidatePath`

**Depends on**: T2
**Requirement**: CONF-03 (extensao)

**Done when**:
- [ ] Regex aceita `+55 (11) 99999-9999`, `(11) 99999-9999`, `11999999999` (formatado)
- [ ] Pagina publica `/[slug]` e revalidada apos save
- [ ] `npm run build` passa

**Tests**: none
**Gate**: build

---

### T8: Corrigir feedback de validação na tela

**What**: Validations rodavam mas nenhum feedback aparecia. Causas: (a) key no form com saveCount limpava errors a cada re-render, (b) banner de erros não existia.

**Where**:
- `app/dashboard/configuracoes/page.tsx` — remover saveCount do key, adicionar banner de erros no topo do form, manter errors inline por campo

**Depends on**: T6
**Requirement**: CONF-05

**Done when**:
- [ ] Banner de erros aparece no topo do form quando validação falha
- [ ] Erros por campo aparecem abaixo dos inputs (nome, slug, whatsapp)
- [ ] `npm run build` passa

**Tests**: none
**Gate**: build

---

### T9: Adicionar test-route para diagnóstico

**What**: Criar rota `POST /api/dev/test-slug` para testar save direto no banco, bypassando form e validação Zod.

**Where**:
- `app/api/dev/test-slug/route.ts` — GET (verifica user+salao) e POST (salva slug diretamente)

**Depends on**: None
**Requirement**: Debug

**Done when**:
- [ ] GET retorna `{ user, salao }` do banco
- [ ] POST salva slug diretamente no banco
- [ ] `npm run build` passa

**Tests**: manual
**Gate**: build

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Fix checkbox pattern | 2 files, pattern change | ✅ Granular |
| T2: Fix nome/slug + erros | 2-3 files, fix + UI | ✅ Granular |
| T3: Verify endereco/redes/whatsapp | 1-2 files, review + fix | ✅ Granular |
| T4: Playwright setup | 3 files, config | ✅ Granular |
| T5: E2E tests | 1 file, test suite | ✅ Granular |
| T6: Fix WhatsApp regex + revalidate | 2 files, regex + revalidatePath | ✅ Granular |
| T8: Fix feedback validação | 1 file, UI error display | ✅ Granular |
| T9: Debug test route | 1 file, API route | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On | Diagram | Status |
|------|-----------|---------|--------|
| T1 | None | T1 first | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer | Matrix | Task Says | Status |
|------|-----------|--------|-----------|--------|
| T1 | Page + server action | none (bugfix) | none | ✅ OK |
| T2 | Page + server action | none (bugfix) | none | ✅ OK |
| T3 | Server action | none (bugfix) | none | ✅ OK |
| T4 | Config files | none (setup) | none | ✅ OK |
| T5 | Test only | e2e | e2e | ✅ OK |
