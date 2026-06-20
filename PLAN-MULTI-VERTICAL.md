# Plano Multi-Vertical — Barbearia → Tatuagem, Salão, Esmalteria

> Status: rascunho para lapidação futura. Não executar até decisão explícita.
> Decisões de arquitetura confirmadas em sessão: tema custom por tenant, subdomínios por vertical, imagens via Stitch AI, foco em Fase 0+1+2.

---

## 1. Diagnóstico do estado atual

O **modelo de dados já é multi-vertical** — a tabela `saloes` (não `barbearias`) tem um campo `config JSONB` em `supabase/migrations/20250616_full_schema.sql:23` pronto para guardar tema + copy por tenant.

A **UI é hardcoded em "barbearia"**. Acoplamentos mapeados:

| Onde | Tipo de acoplamento |
|---|---|
| `components/features/hero-section.tsx:27,40-58` | Imagem, título, subtítulo, CTAs hardcoded |
| `components/features/heritage-section.tsx:3-22,32` | 3 features + ícones (content_cut, local_bar…) hardcoded |
| `components/features/services-section.tsx:3-23` | 3 serviços (corte/barba/ritual) hardcoded |
| `app/[slug]/page.tsx:89-110` | hero-bg, alt, headline, subtítulo, footer "Cuidado Artesanal" |
| `app/page.tsx:12` | SEO description "barbearia" |
| `app/layout.tsx:33` | metadata default "salões e barbearias" |
| `components/features/{profissional-form,schedule-editor}.tsx` | "configurações da barbearia" |
| `app/dashboard/{clientes,configuracoes}/page.tsx` | "clientes da barbearia", "minha-barbearia" |
| `public/images/*.webp` (8 imagens) | 100% barbearia |
| `tailwind.config.ts:13-24` | Playfair Display + Hanken Grotesk fixos |
| `DESIGN.md:114-164` | narrativa toda sobre "vintage industrial / barber" |

Nenhum ponto é estrutural — é tudo cosmético + parametrização.

---

## 2. Decisões de arquitetura

- **Tema custom por tenant**: cada tenant escolhe vertical (1 de 4) + tema (1 preset por vertical) + `custom_primary` opcional com validação de contraste
- **Subdomínios por vertical**: `barbearia.agendafacil.com.br`, `tatuagem.agendafacil.com.br`, `salao.agendafacil.com.br`, `esmalteria.agendafacil.com.br` (próxima fase)
- **Imagens via Stitch AI**: 1 hero + 2 portraits + 3 services por tema novo = 18 webps (próxima fase)
- **Escopo da iteração inicial**: Fase 0+1+2 (fundação técnica + 4 temas) — sem assets, sem marketing, sem onboarding

---

## 3. Estratégia recomendada

### 3.1 Design system → CSS variables + Tailwind lendo vars

- Mover os tokens de cor para **CSS custom properties** em `app/globals.css`
- No `tailwind.config.ts`, mapear `colors.primary = "var(--ds-primary)"`, etc.
- Criar presets `[data-theme="heritage-steel"]`, `[data-theme="ink-iron"]`, `[data-theme="velvet-bloom"]`, `[data-theme="pastel-studio"]` no `globals.css`
- Em `app/[slug]/layout.tsx`, setar `<html data-theme={salao.theme_id}>` antes do primeiro paint → zero FOUC
- Tokens não-cor (radii, spacing, elevation, font sizes) permanecem estáticos

### 3.2 Custom primary override

`custom_primary` opcional via inline style no `<html>`. Função `lib/theme/derive-tokens.ts` calcula:
- `on-primary` (preto/branco conforme luminância)
- `primary-container`, `primary-fixed`, `primary-fixed-dim`
- `surface-tint`, `inverse-primary`
- `on-primary-container`, `on-primary-fixed`, `on-primary-fixed-variant`

Garante contraste WCAG ≥ 4.5:1.

### 3.3 Fontes

`next/font/google` carrega 8 famílias: Playfair Display, Hanken Grotesk, Anton, Inter, Cormorant Garamond, DM Sans, Fraunces, Manrope. Map por tema em `app/fonts/index.ts`. Aplicação via `style={{ fontFamily: theme.fonts.body }}` no `<html>`.

### 3.4 Logo opcional

Componente `<TenantLogo salao={...} />` com fallback wordmark. Upload via Supabase Storage; campo `logo_url` na tabela `saloes`.

---

## 4. Schema do `config` (proposta)

### 4.1 Migration nova: `20250…_tenant_theme.sql`

```sql
ALTER TABLE saloes
  ADD COLUMN vertical TEXT NOT NULL DEFAULT 'barbearia'
    CHECK (vertical IN ('barbearia','tatuagem','salao','esmalteria')),
  ADD COLUMN theme_id TEXT NOT NULL DEFAULT 'heritage-steel'
    CHECK (theme_id IN ('heritage-steel','ink-iron','velvet-bloom','pastel-studio')),
  ADD COLUMN custom_primary TEXT,           -- hex opcional (#XXXXXX)
  ADD COLUMN logo_url TEXT;                  -- bucket storage
```

`vertical` e `theme_id` viram colunas tipadas (queries e CHECK). Copy detalhada continua em `config JSONB`.

### 4.2 Tipos: `types/theme.ts`

```ts
export type Vertical = 'barbearia'|'tatuagem'|'salao'|'esmalteria';
export type ThemeId = 'heritage-steel'|'ink-iron'|'velvet-bloom'|'pastel-studio';

export type ThemeConfig = {
  hero: { tagline: string; title: string; subtitle: string;
          cta_primary: string; cta_secondary: string; bg_image: string };
  heritage: { eyebrow: string; title: string;
              features: { icon: string; title: string; description: string }[] };
  services_preview: { eyebrow: string; title: string;
                      items: { name: string; price: string; badge?: string;
                               description: string }[] };
  footer: { tagline: string };
};
```

---

## 5. Os 4 temas

| Tema | Vertical | Mood | Paleta principal | Fontes |
|---|---|---|---|---|
| **Heritage & Steel** | Barbearia | Vintage industrial editorial | Charcoal `#121414` + Aged Gold `#c5a059` | Playfair Display + Hanken Grotesk |
| **Ink & Iron** | Tatuagem | Dark grunge neo-tradicional | Ink Black `#0a0a0a` + Crimson `#dc2626` (accent: cyan `#06b6d4`) | Anton + Inter |
| **Velvet & Bloom** | Salão de beleza | Feminino moderno sofisticado | Cream `#faf7f4` + Burgundy `#7c2d3a` (accent: dusty rose `#c19a8b`) | Cormorant Garamond + DM Sans |
| **Pastel Studio** | Esmalteria | Trendy, clean, divertido | Off-white `#fdfcfb` + Blush `#ec4899` (accent: mint `#86d4c8`, sunny yellow `#fbbf24`) | Fraunces + Manrope |

Cada tema = ~30 vars no `globals.css` (primary, on-primary, primary-container, primary-fixed variants, surface, surface-container-{lowest,low,*,high,highest}, on-surface, on-surface-variant, outline, outline-variant, tertiary, error, etc).

### Copy default por tema

- **Heritage & Steel**: copy atual (extrair de `hero-section.tsx`, `heritage-section.tsx`, `services-section.tsx`, `app/[slug]/page.tsx`).
- **Ink & Iron**: "A Arte na Pele. Agende sua sessão com artistas do estúdio."
- **Velvet & Bloom**: "Beleza em cada detalhe. Agende seu momento de cuidado."
- **Pastel Studio**: "Suas unhas, sua arte. Agende sua experiência."

---

## 6. Fases de execução

### Fase 0 — Externalizar copy (1–2 dias)

1. Migration `20250…_tenant_theme.sql` com colunas novas
2. `types/theme.ts`
3. `lib/themes/defaults.ts` com `DEFAULTS: Record<ThemeId, ThemeConfig>`
4. Refatorar para props (sem mudar markup):
   - `components/features/hero-section.tsx`
   - `components/features/heritage-section.tsx`
   - `components/features/services-section.tsx`
   - `app/[slug]/page.tsx`
   - `app/page.tsx`
   - `app/layout.tsx`
5. Server-side merge: `finalConfig = { ...DEFAULTS[theme_id], ...salao.config }`
6. Default theme = "heritage-steel" → build visualmente idêntico ao atual

### Fase 1 — Design system via CSS variables (1–2 dias)

1. `app/globals.css`: declarar `:root` com tokens não-cor + 1 bloco `[data-theme="heritage-steel"]` com tokens cor
2. `tailwind.config.ts`: `colors.primary = "var(--ds-primary)"`, etc. (mapeamento 1:1 do bloco atual)
3. `app/fonts/index.ts`: `next/font/google` para 8 famílias + `THEME_FONTS: Record<ThemeId, ...>`
4. `lib/theme/derive-tokens.ts`: calcula primary-container, on-primary, surface-tint, etc a partir de `custom_primary` hex
5. `app/[slug]/layout.tsx`: `<html data-theme={salao.theme_id} style={customPrimary ? deriveCustomTokens(customPrimary) : undefined}>`
6. Componente `<TenantLogo salao={...} />` com fallback wordmark
7. Remover import estático de `next/font` em `app/layout.tsx`, mover para `app/fonts/index.ts`

### Fase 2 — Criar 3 temas novos (0,5 dia)

1. Copiar bloco `[data-theme="heritage-steel"]` em `globals.css` × 3
2. Trocar hexes conforme tabela da seção 5
3. Adicionar `DEFAULTS['ink-iron']`, `DEFAULTS['velvet-bloom']`, `DEFAULTS['pastel-studio']` em `lib/themes/defaults.ts` com copy de cada vertical
4. Mapear `THEME_FONTS` em `app/fonts/index.ts`

### Verificação Fase 0+1+2

| Teste | Como |
|---|---|
| Build não regride | `npm run build` + `npm run lint` + `npm run typecheck` |
| Tema "heritage-steel" idêntico ao atual | Playwright: screenshot `[slug]/page.tsx` antes/depois, pixel diff < 1% |
| Trocar `theme_id` muda visual | Playwright: 4 testes (um por tema), screenshot da home |
| `custom_primary` + contraste OK | `deriveCustomTokens` testado com 5 hexes; assert WCAG ≥ 4.5:1 |
| Logo opcional | Playwright: sem logo → wordmark; com logo → imagem |
| Fontes sem FOUC | `document.fonts.ready` antes do paint |
| Dashboard sem regressão | Smoke test login + 3 páginas |

---

## 7. Fases futuras (fora deste escopo)

| # | Fase | Entregável | Esforço |
|---|---|---|---|
| 3 | Asset packs via Stitch | 18 webps (6/tema) em `public/images/themes/{id}/` | 1–2 dias |
| 4 | Logo + ícone-picker por vertical no config | Material Symbols names por tema | 0,5 dia |
| 5 | Dashboard context: `lib/vertical-labels.ts` + atualizar textos hardcoded | Texto coerente em todo `/dashboard` | 1 dia |
| 6 | Marketing: subdomínios por vertical via middleware Next | Landing page por vertical | 1–2 dias |
| 7 | Onboarding: aba Tema em Configurações + signup com vertical picker | Self-serve por vertical | 1–2 dias |

---

## 8. Próximos passos

Antes de executar:

- [ ] Validar nomes finais dos 4 temas (atual: `heritage-steel`, `ink-iron`, `velvet-bloom`, `pastel-studio`)
- [ ] Lapidar paleta exata de cada tema (especialmente Ink & Iron — crimson vs outras opções)
- [ ] Definir 3 features padrão por tema (substituir "Mestres Artesãos / Salão Privado / Ferramentas de Precisão")
- [ ] Definir 3 serviços preview padrão por tema
- [ ] Confirmar storage bucket para logos (`logos` em Supabase Storage, RLS por `salao_id`)
- [ ] Atualizar `DESIGN.md` removendo a narrativa única de "barbearia" e adicionando seção "Multi-vertical theming"
- [ ] Criar `.specs/features/multi-vertical/` com `spec.md` e `tasks.md` no padrão do projeto

Quando for executar, começar pela migration + tipagem + defaults (Fase 0.1–0.3) para validar o schema antes de tocar no design system.
