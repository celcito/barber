# Plano de Redesign — AgendaFácil (Barbearia Sofisticada)

## Diretrizes
- **Paleta:** Charcoal + Cobre queimado + Creme de papel
- **Tipografia:** Geist (body) + Geist Mono (dados) — fontes locais em `app/fonts/`
- **Escopo:** Bloco 0 (bug fix menus) + Bloco 1 (fundação) + Bloco 2 (componentes) + Bloco 3 (dashboard)
- **Skill:** `design-taste-frontend` — DESIGN_VARIANCE=8, MOTION_INTENSITY=6, VISUAL_DENSITY=4

## Arquivos (13)

| # | Arquivo | Mudança |
|---|---------|---------|
| 1 | `components/dashboard/sidebar.tsx` | Fix bug + redesign completo |
| 2 | `components/ui/sidebar.tsx` | Fix bug (mesmo padrão) |
| 3 | `app/globals.css` | Novos tokens barbearia |
| 4 | `tailwind.config.ts` | Mapear tokens + font-mono |
| 5 | `app/layout.tsx` | Trocar Google Fonts por localFont |
| 6 | `components/ui/button.tsx` | Variante primary em charcoal |
| 7 | `components/ui/card.tsx` | Anel externo com tint de cobre |
| 8 | `components/ui/badge.tsx` | Cobre + dot pulsante |
| 9 | `app/dashboard/page.tsx` | Bento 2.0 KPIs |
| 10 | `app/dashboard/agenda/page.tsx` | Cores por status + tabular-nums |
| 11 | `app/dashboard/servicos/page.tsx` | Bento featured + monoespaçado |
| 12 | `app/dashboard/profissionais/page.tsx` | Monograma + badge pulsante |
| 13 | `app/dashboard/configuracoes/page.tsx` | Toggles + labels Geist Mono |
