# Spec: Checkbox — Componente do Design System

## Visão Geral
Substituir todos os `<input type="checkbox">` nativos por um componente `Checkbox` que respeita os tokens do design system "Heritage & Steel": bordas suaves em estado neutro, preenchimento Aged Gold quando marcado, foco visível com anel Aged Gold e estados disabled/indeterminate bem definidos.

## Motivação
- O `<input type="checkbox">` nativo renderiza com estilos do browser (Webkit/Firefox) que não casam com a paleta escura do DS — checkmark fica praticamente invisível em superfícies escuras
- Não há suporte nativo a `indeterminate` (estado "alguns marcados" em listas hierárquicas)
- Classes utilitárias estavam inconsistentes entre arquivos: `w-4 h-4` vs `w-5 h-5`, `border-outline` vs `border-outline-variant`, `focus:ring-primary` sem offset
- Falta animação de transição ao marcar/desmarcar

## Componente

Localização: `components/ui/checkbox.tsx`

### API

```ts
interface CheckboxProps {
  // Estado (controlado ou não-controlado)
  checked?: boolean;                // controlado
  defaultChecked?: boolean;         // não-controlado (default: false)
  indeterminate?: boolean;          // estado misto (ex: parent de checkboxes filhos)
  onCheckedChange?: (v: boolean) => void;

  // Aparência
  size?: "sm" | "md" | "lg";        // default: "md" (20px / 24px focus ring)
  error?: boolean;                  // borda e label ficam em --error
  disabled?: boolean;

  // Acessibilidade / Form
  name?: string;                    // cria <input type="hidden"> com o valor
  value?: string;                   // valor do hidden input (default: "true")
  id?: string;                      // default: useId()
  label?: string;                   // texto do label associado
  description?: string;             // helper text abaixo do label
}
```

### Tokens do DS utilizados

| Token | Onde aplica |
|-------|-------------|
| `primary` (#c5a059) | fundo + borda do estado `checked`/`indeterminate`; focus ring |
| `on-primary` (#412d00) | cor do check icon (alto contraste) |
| `surface-container-highest` (#333535) | fundo do estado `unchecked` |
| `outline-variant` (#4e4639) | borda padrão do estado `unchecked` |
| `outline` (#9a8f80) | borda em hover (unchecked) |
| `error` (#ffb4ab) | borda + label quando `error={true}` |
| `on-surface` (#e2e2e2) | cor do label padrão |
| `on-surface-variant` (#d1c5b4) | cor do description |
| `background` (#121414) | cor de offset do focus ring |
| `rounded.DEFAULT` (0.125rem) | border-radius do box (consistente com `rounded-sm` do DS) |
| animação `scale-in` (já existente) | entrada do check icon |

### Estados visuais

| Estado | Box background | Box border | Check icon | Focus ring |
|--------|---------------|-----------|-----------|-----------|
| unchecked | `surface-container-highest` | `outline-variant` (erro: `error`) | — | 2px `primary` + 2px offset `background` |
| unchecked + hover | `surface-container-highest` | `outline` | — | idem |
| checked | `primary` | `primary` | ✓ (`on-primary`) | idem |
| indeterminate | `primary` | `primary` | — (linha horizontal) | idem |
| disabled | qualquer | qualquer | qualquer, 50% opacity, `cursor-not-allowed` | — |

### Sizes

| Size | Box | Icon | Quando usar |
|------|-----|------|------------|
| `sm` | 16px (w-4 h-4) | 10px | Inline em listas densas, sidebars |
| `md` | 20px (w-5 h-5) | 12px | Default — formulários |
| `lg` | 24px (w-6 h-6) | 14px | Telas de consentimento, destaque |

### Interação

- Click no botão → toggle
- Click no label (se passado) → toggle (e.preventDefault para não rolar)
- `Tab` → foco, `Space`/`Enter` → toggle
- `aria-checked`: `true` | `false` | `"mixed"` (indeterminate)
- `aria-invalid="true"` quando `error={true}`
- `data-state` para CSS: `"unchecked" | "checked" | "indeterminate"`

### Integração com `<form>`

Quando `name` é passado, o componente renderiza um `<input type="hidden">` ao lado do botão. O valor do hidden é:
- `value ?? "true"` quando `checked === true`
- `""` (string vazia) quando `checked === false`

Isso permite que o checkbox funcione em:
- Server Actions (Next.js) — FormData contém `name` apenas se marcado
- `<form action="...">` — idem
- Validação com `required` nativo: usar estado controlado + validação no submit (vide `components/booking/step-client.tsx`)

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `components/ui/checkbox.tsx` | **novo** — componente |
| `components/booking/step-client.tsx` | LGPD consent agora usa `<Checkbox>` + estado controlado + validação no submit |
| `components/features/profissional-form.tsx` | 3 checkboxes (ativo, usar horários do salão, dia aberto) |
| `components/features/schedule-editor.tsx` | 2 checkboxes (usar horários do salão, dia aberto) |
| `app/dashboard/configuracoes/page.tsx` | 1 checkbox (horário do dia); `handleSave` agora lê `cb.value` (do hidden input) em vez de `cb.checked` |

## Não-objetivos (defer)
- **Toggle/Switch** (pílula com thumb deslizante) — visualmente diferente de checkbox. Existe como padrão `sr-only peer` em `app/dashboard/configuracoes/page.tsx` (linhas 521-532, 630-641, 643-654). Pode virar componente `Switch` em spec futura.
- **Checkbox group** (estado `indeterminate` automático em pais) — fora do escopo desta spec.
- **Animações de arrastar/soltar** (drag & drop reordering) — não aplicável.

## Acessibilidade
- ✅ `role="checkbox"` + `aria-checked` (true/false/mixed)
- ✅ Label associado via `htmlFor` quando `label` é passado
- ✅ Foco visível com anel `primary` 2px + offset 2px
- ✅ Navegação por teclado: Tab + Space/Enter
- ✅ `aria-invalid` quando há erro
- ✅ `data-state` para testes/CSS

## Padrão de uso

```tsx
// 1. Não-controlado, sem label (uso raro)
<Checkbox name="ativo" defaultChecked />

// 2. Controlado com label inline
<Checkbox
  checked={state}
  onCheckedChange={setState}
  label="Aceito os termos"
/>

// 3. Com descrição
<Checkbox
  checked={consent}
  onCheckedChange={setConsent}
  label="Concordo com a LGPD"
  description="Autorizo o uso dos meus dados..."
  error={!consent && tried}
/>

// 4. Em formulários (server action)
<Checkbox
  name="notificar"
  value="true"
  defaultChecked={salao.notificar_dono}
/>
// → FormData terá "notificar" = "true" ou ausente
```

## Validação

- `npx tsc --noEmit` ✓ 0 erros
- `npm run build` ✓ 28/28 páginas
- Playwright E2E: smoke do booking flow com LGPD consent (ainda bloqueia submit sem marcar)
- Visual: screenshot de cada estado (unchecked/checked/indeterminate/disabled/hover/focus)
