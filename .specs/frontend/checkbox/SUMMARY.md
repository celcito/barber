# Summary: Checkbox — Componente do Design System

## Status: Implementado e Documentado

## Arquivos
- **Novo:** `components/ui/checkbox.tsx`
- **Modificados:**
  - `components/booking/step-client.tsx`
  - `components/features/profissional-form.tsx`
  - `components/features/schedule-editor.tsx`
  - `app/dashboard/configuracoes/page.tsx`
- **Spec:** `.specs/frontend/checkbox/spec.md`
- **Tasks:** `.specs/frontend/checkbox/tasks.md`

## O que mudou

### Antes
- `<input type="checkbox">` nativos com classes inconsistentes (`w-4 h-4` vs `w-5 h-5`, `border-outline` vs `border-outline-variant`)
- Checkmark pouco visível em superfícies escuras
- Sem `indeterminate`, sem animação, sem padronização de foco
- Toggle switches usando `bg-white` + `border-gray-300` (fora do DS)

### Depois
- Componente `<Checkbox>` único, com tokens do DS
- 3 sizes (sm/md/lg)
- 4 estados (unchecked/checked/indeterminate/disabled) com animações
- Focus ring `primary` 2px + offset 2px
- Suporte nativo a `name` (hidden input) para server actions / forms
- Label e description opcionais (helper text)
- Erro inline (borda + label em `--error`)

## Próximas specs recomendadas
- **Switch/Toggle** — substituir `sr-only peer` em `configuracoes/page.tsx` linhas 521-532, 630-641, 643-654
- **Checkbox group com indeterminate automático** — para hierarquia pai/filho
