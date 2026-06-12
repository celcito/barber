# Guia rápido: `@layer components` com Tailwind (Português-BR)

## Visão geral
- O que é: `@layer components` permite definir classes semânticas reutilizáveis compostas por utilitários Tailwind usando `@apply`.
- Por que usar: centraliza estilos, reduz repetição de classes longas no JSX e dá um controle claro sobre ordem e cascata do CSS.

## Como funciona (resumo)
- Ordem de emissão do Tailwind: `base` → `components` → `utilities`. Classes em `components` ficam entre regras base e utilitários.
- Defina suas classes de componente no arquivo CSS global (ex.: `app/globals.css`).
- Use as classes no JSX: `className="btn btn-primary btn-md"`.

## Exemplo mínimo
- No arquivo global (ex.: `app/globals.css`):

```css
@layer components {
  .btn {
    @apply relative inline-flex items-center justify-center rounded font-body font-medium transition-all;
  }

  .btn-primary {
    @apply bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] shadow-card;
  }

  .btn-md {
    @apply px-6 py-3 font-label-md text-label-md;
  }
}
```

- No componente React:

```tsx
<button className="btn btn-primary btn-md">Confirmar</button>
```

## Passo a passo
1. Abra seu CSS global (ex.: `app/globals.css`).
2. Crie (ou atualize) um bloco `@layer components { ... }`.
3. Defina classes semânticas com `@apply` usando utilitários Tailwind.
4. Use essas classes em seus componentes React/JSX.
5. Se o Tailwind não gerar as classes, verifique `tailwind.config.ts` → `content` para incluir seus arquivos.

## Dicas e boas práticas
- Evite strings dinâmicas que o compilador Tailwind não consegue detectar; se precisar, defina a variante no `@layer components` para garantir a saída.
- Prefira `@apply` em `components` ao invés de `!important` para resolver problemas de cascade.
- Coloque tokens de tipografia (ex.: `.font-body`) em `@layer base` ou `utilities` e use `@apply` dentro do componente para consistência.
- Nomeie semanticamente: `btn`, `card`, `nav-item` — facilita manutenção.

## Debugging rápido
- Verifique o CSS compilado: `.next/static/css/app/layout.css` e procure sua classe (ex.: `.btn-primary`).
- No DevTools: selecione o elemento → painel Styles → veja qual regra define `color`/`font-family` e sua origem (arquivo:linha).
- Se uma regra estiver faltando, confirme que o caminho do arquivo está listado em `tailwind.config.ts` → `content`.

## Quando `@layer components` não resolve
- Se alguma biblioteca ou reset (ex.: *user agent* ou reset CSS) estiver aplicando estilo com maior especificidade, inspecione DevTools e aumente seletividade apenas quando necessário (evite `!important`).
- Em casos específicos, aplicar o estilo via prop `style={{ color: 'var(--color-on-primary)' }}` no componente é uma alternativa pragmática.

## Exemplo aplicado ao projeto
- Eu já adicionei classes `btn`, `btn-primary`, `btn-md` em `app/globals.css` e atualizei `components/ui/button.tsx` para usá-las.

---

Se quiser, eu posso:
- adicionar comentários inline no arquivo `app/globals.css` explicando cada regra, ou
- gerar versões resumida e detalhada do tutorial, ou
- abrir o dev server e confirmar visualmente as mudanças.

Qual prefere?