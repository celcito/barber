# Tasks: Checkbox — Componente do Design System

## Status: Concluído

## Tarefas

- [x] **T1** — Mapear todos os `<input type="checkbox">` no projeto
  - `components/booking/step-client.tsx` (LGPD consent)
  - `components/features/schedule-editor.tsx` (2)
  - `components/features/profissional-form.tsx` (3)
  - `app/dashboard/configuracoes/page.tsx` (1 checkbox + 3 toggle switches)

- [x] **T2** — Criar `components/ui/checkbox.tsx`
  - Controlado e não-controlado (`checked` / `defaultChecked`)
  - Sizes sm/md/lg
  - Estados: unchecked / checked / indeterminate / disabled
  - Tokens do DS: `primary`, `on-primary`, `surface-container-highest`, `outline-variant`, `outline`, `error`
  - Focus ring `primary` 2px + offset 2px `background`
  - Animação `scale-in` no check icon
  - Suporte a `name` + hidden input para forms
  - Label e description opcionais
  - `forwardRef` para integração com formulários

- [x] **T3** — Substituir checkboxes nativos
  - `components/booking/step-client.tsx`: LGPD consent
    - Adicionado estado `lgpdConsent` + validação no `handleSubmit`
    - Erro inline (`error={lgpdError}`) quando tenta submit sem marcar
  - `components/features/profissional-form.tsx`: 3 checkboxes
    - "Profissional ativo" (não-controlado com `defaultChecked` + `name="ativo"`)
    - "Usar horários do salão" (controlado, com description)
    - Por dia da semana (controlado, size sm)
  - `components/features/schedule-editor.tsx`: 2 checkboxes
    - "Usar horários do salão" (controlado, com description)
    - Por dia da semana (controlado, size sm)
  - `app/dashboard/configuracoes/page.tsx`: 1 checkbox
    - "Aberto" por dia (não-controlado com `defaultChecked` + `name`)
    - `handleSave` atualizado para ler `cb.value` (hidden input) em vez de `cb.checked`
    - Toggle switches (3) **não foram alterados** — são componentes diferentes

- [x] **T4** — Documentar spec
  - `.specs/frontend/checkbox/spec.md` com API, tokens, estados, tamanhos, acessibilidade
  - Esta tasks file

- [x] **T5** — Validação
  - `npx tsc --noEmit` → 0 erros
  - `npm run build` → 28/28 páginas ✓
  - Playwright E2E: 11/11 testes passaram
    - NOVO form: 1 checkbox ("ativo")
    - EDIT Carlos: 9 checkboxes (Carlos tem horarios próprios)
    - Toggle "usar salão" ON → per-day somem, restam 2
    - Configurações: 7 checkboxes (dias)
    - LGPD unchecked initially
    - Submit sem LGPD → aria-invalid=true
    - Check LGPD → aria-invalid removido
    - Submit com LGPD → agendamento criado ✓

## Próximas specs (defer)

- **Switch/Toggle component** — substituir os 3 toggle switches do `configuracoes/page.tsx` que usam o padrão `sr-only peer` (cores fora do DS: `bg-white`, `border-gray-300`)
- **Checkbox group com indeterminate automático** — para hierarquia pai/filho
