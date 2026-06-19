---
name: Heritage & Steel
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#e9c176'
  on-primary: '#412d00'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#775a19'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#b8c8da'
  on-tertiary: '#223240'
  tertiary-container: '#97a7b8'
  on-tertiary-container: '#2d3d4b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#d4e4f6'
  tertiary-fixed-dim: '#b8c8da'
  on-tertiary-fixed: '#0d1d2a'
  on-tertiary-fixed-variant: '#394857'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built for a premium barbering experience that bridges the gap between traditional craftsmanship and modern sophistication. The target audience is the discerning individual who values grooming as a ritual rather than a chore. 

The aesthetic follows a **Vintage Industrial** style with a high-end editorial finish. It combines the raw, structural honesty of industrial design (charcoal tones, slate textures) with the warmth and prestige of luxury (aged gold accents, refined serif typography). The interface should feel established, authoritative, and meticulously curated, evoking the atmosphere of a private members' club.

## Colors

The palette is anchored in deep, masculine tones to create an atmosphere of focus and exclusivity.

*   **Primary (Aged Gold - #C5A059):** Used sparingly for high-impact moments: primary actions, active states, and premium signaling. It represents the "craft" element.
*   **Secondary (Charcoal - #121212):** The foundation of the UI. Used for main backgrounds and deep surfaces to provide a moody, cinematic backdrop.
*   **Tertiary (Slate Grey - #708090):** Provides architectural structure. Used for borders, dividers, and secondary text to soften the transition between black and white.
*   **Neutral (Off-White - #F5F5F5):** Reserved for primary body text and high-contrast labels to ensure maximum legibility against dark backgrounds.

## Typography

This design system utilizes a high-contrast typographic pairing to reinforce the vintage-modern narrative. 

**Playfair Display** (Serif) is the voice of the brand. It is used for all headings to provide an editorial, prestigious feel. **Hanken Grotesk** (Sans-serif) provides the functional backbone, offering exceptional clarity for booking flows, service lists, and descriptions. Labels should often use uppercase styling with slight letter spacing to mimic traditional shop signage.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain a contained, gallery-like feel, transitioning to a fluid model on mobile. 

A strict 8px base unit drives all spatial decisions. Generous vertical "stack" spacing is used to give elements room to breathe, reflecting the unhurried nature of a premium service. Desktop layouts should utilize 12 columns with wide 40px margins to create a focused central stage for content.

## Elevation & Depth

Depth is achieved through **Tonal Layers** rather than heavy shadows. 

1.  **Base Layer:** Charcoal (#121212) for the main background.
2.  **Surface Layer:** A slightly lighter variation of charcoal (approx. 5% lighter) for cards and containers.
3.  **Accent Depth:** Fine 1px borders in Slate Grey or low-opacity Aged Gold define boundaries.

Where shadows are necessary (e.g., floating action buttons), use "Ambient Shadows"—ultra-diffused, black-tinted glows that feel like soft lighting in a dimly lit studio.

## Shapes

The shape language is disciplined and professional. We use **Soft** corners (0.25rem / 4px) to take the edge off the industrial aesthetic without making the UI feel "bubbly" or overly consumer-grade. This subtle rounding suggests precision—like the clipped corner of a barber's blade.

## Components

*   **Buttons:** Primary buttons feature a solid Aged Gold background with Charcoal text, using the `label-md` typographic style. Secondary buttons use a ghost style with a 1px Slate border.
*   **Cards:** Use a slightly elevated surface color with a subtle 1px border. Card headers should always use the Serif headline font.
*   **Inputs:** Clean, bottom-border-only fields or fully outlined with very thin Slate borders. Focus states transition the border to Aged Gold.
*   **Chips/Tags:** Small, rectangular with `rounded-sm`. Used for service categories (e.g., "Beard Trim", "Hot Towel").
*   **Icons:** Use "classic barber" iconography—straight razors, shears, and poles. Icons should be thin-line (2px stroke) to match the refinement of the Hanken Grotesk typeface.
*   **Lists:** Service menus should use a "dotted leader" style (Service Name ........ $Price) to evoke traditional printed menus.
*   **Checkboxes:** Custom `<Checkbox>` (see `components/ui/checkbox.tsx`). Square box (`rounded`) with 2px border. Unchecked uses `surface-container-highest` fill + `outline-variant` border; checked/indeterminate use `primary` fill with `on-primary` checkmark. Focus ring is 2px `primary` with 2px offset in `background`. Sizes: `sm` (16px), `md` (20px, default), `lg` (24px). Animate the check via `scale-in` keyframe.
*   **Toggles/Switches (defer):** Currently implemented inline via the `sr-only peer` Tailwind pattern in `configuracoes/page.tsx`. Visual note: thumb uses `bg-white` + `border-gray-300`, which does not match the DS — should be migrated to a `<Switch>` component using `surface-container-highest` and `on-surface` tokens.
