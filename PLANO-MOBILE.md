# Plano de Refinamento Mobile - AgendaFácil

## 1. Viewport & Safe Areas (Crítico)

- Adicionar `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` no `app/layout.tsx`
- Adicionar padding-safe no body para respeitar notch/home indicator
- Adicionar `overflow-x: hidden` no body

## 2. Booking Flow - Layout Responsivo (Alto impacto)

- **booking-flow.tsx**: Adicionar breakpoint `md:` para grid 2 colunas em tablets (768px-1023px)
- **step-time.tsx**: Mudar `grid-cols-3` para `grid-cols-2 sm:grid-cols-3` (telas < 360px)
- **step-date.tsx**: Aumentar touch targets dos dias de `h-10` para `min-h-[44px]` (WCAG)
- **booking-confirmation.tsx**: Reduzir `px-stack-lg` (48px) para mobile

## 3. Touch & Scroll (Performance mobile)

- Adicionar `touch-action: manipulation` para botões
- Adicionar `-webkit-overflow-scrolling: touch` para containers scrolláveis
- Adicionar `overscroll-behavior: contain` para prevenir scroll chaining

## 4. Tipografia Responsiva (UX)

- Verificar se `display-lg` (clamp(2.5rem, 5vw, 4.5rem)) funciona em 320px
- Ajustar padding mobile nos componentes de formulário

## 5. Navegação Mobile (UX)

- Navbar já usa `md:hidden` - verificar menu mobile
- Footer: links legais podem estar muito pequenos para tap

## 6. Animações (Performance)

- Já tem `prefers-reduced-motion` - bom
- Verificar se animações de página não causam layout shift

---

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `app/layout.tsx` | viewport meta, safe areas |
| `app/globals.css` | safe areas, touch, scroll |
| `components/booking/booking-flow.tsx` | grid responsivo |
| `components/booking/step-time.tsx` | grid cols |
| `components/booking/step-date.tsx` | touch targets |
| `components/booking/booking-confirmation.tsx` | padding mobile |
| `components/booking/step-client.tsx` | form sizing |

## Não modificar

- Dashboard (já tem sidebar responsiva)
- Homepage sections (não são prioridade para agendamento)
