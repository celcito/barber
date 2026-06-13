# Plano de Integração — Página Inicial do Stitch

## Objetivo
Criar a homepage de apresentação da barbearia como uma landing page premium, com foco em:
- destacar identidade visual e serviços premium
- guiar visitantes para agendamento rápido
- ser responsiva, acessível e alinhada ao design existente do projeto

## Origem
- **Stitch Project**: `10609284384409249817` (barbearia)
- **Screen**: "Página Inicial - The Grooming Ritual" (`338ecf1da80b4a09b07bca569ab85d31`)
- **URL**: https://stitch.withgoogle.com/projects/10609284384409249817

## Estrutura da Página

| Seção | Propósito | Componente | Entrega mínima |
|-------|-----------|------------|----------------|
| **TopNavBar** | Navegação fixa, identidade e botão de ação | `components/layout/navbar.tsx` | logo + links + CTA Admin |
| **Hero** | Primeiro impacto visual e convite ao agendamento | `components/features/hero-section.tsx` | imagem de fundo, título, descrição, CTA |
| **Serviços** | Comunicação rápida dos principais serviços | `components/features/services-section.tsx` | cards com nomes, valores e descrição curta |
| **Por que escolher** | Confiança + diferenciais da barbearia | `components/features/heritage-section.tsx` | layout com imagem + 3 benefícios |
| **Galeria** | reforçar atmosfera premium com imagens reais | `components/features/gallery-section.tsx` | grid de fotos estilizado |
| **Local & Horários** | facilitar contato e agendamento presencial | `components/features/location-section.tsx` | endereço, horários e mapa visual |
| **Footer** | navegação secundária e informações legais | `components/layout/footer.tsx` | links úteis, copyright, redes sociais |

## Arquivos de Referência e Ação

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `components/layout/navbar.tsx` | Criar barra de navegação fixa e responsiva |
| 2 | `components/features/hero-section.tsx` | Criar hero com imagem rica e CTA de agendamento |
| 3 | `components/features/services-section.tsx` | Criar cards de serviços com destaque visual |
| 4 | `components/features/heritage-section.tsx` | Criar seção de diferenciais da barbearia |
| 5 | `components/features/gallery-section.tsx` | Criar grid de imagens com estilo premium |
| 6 | `components/features/location-section.tsx` | Criar área de localização e horários |
| 7 | `components/layout/footer.tsx` | Criar footer com links e contato |
| 8 | `app/page.tsx` | Compor as seções e gerenciar layout geral |
| 9 | `public/images/` | Adicionar ou validar imagens de apoio |

## Conteúdo da Página

### Hero
- Título principal: **A Arte do Grooming Tradicional**
- Subtítulo: **Experiência premium de barbearia para quem busca precisão e presença**
- CTA principal: **Agende Seu Ritual**
- CTA secundário: **Conheça os Serviços**
- Imagem de fundo: interior da barbearia ou close nas ferramentas

### Serviços principais
1. **O Corte Ritual** — R$45
   - Corte personalizado com consulta, acabamento com máquina ou tesoura e finalização com navalha.
2. **Esculpir Barba** — R$35
   - Modelagem e acabamento completo com toalha quente e óleos premium.
3. **Ritual Completo** — R$75
   - Corte assinatura, manutenção de barba, máscara de carvão e tratamento com toalha quente.

### Diferenciais
- **Mestres Artesãos** — barbeiros com técnica, tradição e precisão
- **Salão Privado** — ambiente exclusivo e acolhedor
- **Ferramentas de Precisão** — utensílios premium para acabamento impecável

### Local & Horários
- Segunda a Sexta: 10:00 – 20:00
- Sábado: 09:00 – 18:00
- Domingo: 11:00 – 16:00
- Endereço de exemplo: 124 Heritage Lane, Industrial District, Manhattan, NY 10012

## Imagens e Ativos

### Arquivos sugeridos
- `hero-bg.webp` — interior da barbearia (usar se já existir)
- `barber-ritual.webp` — ferramentas de barbeiro
- `barber-portrait.webp` — retrato do barbeiro mestre
- `hot-towel.webp` — toalha quente e ritual de barba
- `precision-cut.webp` — corte de precisão
- `barber-chairs.webp` — ambiente/cadeiras da barbearia

### Observação
Usar imagens otimizadas e `next/image` para performance. Se não houver assets Stitch, substituir por fotos existentes ou placeholders estilizados.

## Traduções de texto chave

| Inglês | Português |
|--------|-----------|
| The Grooming Ritual | O Ritual da Barbearia |
| The Art of Traditional Grooming | A Arte do Grooming Tradicional |
| Established MMXXIV | Fundado em MMXXIV |
| Book Your Ritual | Agende Seu Ritual |
| Curated Services | Serviços Selecionados |
| Precision engineered for the discerning individual | Precisão projetada para o indivíduo exigente |
| The Ritual Cut | O Corte Ritual |
| A tailored haircut including consultation... | Um corte personalizado incluindo consulta... |
| Beard Sculpting | Esculpir Barba |
| Complete shaping and lining with hot towel... | Modelagem completa com tratamento de toalha quente... |
| Ritual Complete | Ritual Completo |
| The full experience: Signature haircut... | A experiência completa: corte assinatura... |
| The Heritage of Excellence | O Legado da Excelência |
| Master Artisans | Mestres Artesãos |
| Our barbers are craftsmen with decades... | Nossos barbeiros são artesãos com décadas... |
| Private Lounge | Salão Privado |
| Complementary top-shelf spirits... | Destilados premium e espresso... |
| Precision Tools | Ferramentas de Precisão |
| We utilize hand-forged steel... | Utilizamos aço forjado à mão... |
| The Sanctuary | O Santuário |
| Service Hours | Horário de Funcionamento |
| Book Your Appointment | Agende Seu Horário |

## Design System e Implementação

- **Cores**: `primary` (#e9c176), `surface` (#121414), `outline-variant` (#4e4639)
- **Fontes**: Playfair Display para headlines, Hanken Grotesk para corpo de texto
- **Espaçamentos**: `stack-sm` (12px), `stack-md` (24px), `stack-lg` (48px)
- **Estilo**: manter estética escura, sofisticada e moderna
- **Utilitários**: `.dotted-leader` em `globals.css` para detalhes tipográficos

## Requisitos de implementação

1. Navegação fixa responsiva com estado mobile/hamburger.
2. Hero visual forte, CTA claro e carregamento otimizado com `next/image`.
3. Cards de serviços com hover suave e contraste de foco.
4. Layout responsivo: 3 colunas desktop → 1 coluna mobile.
5. Seção de diferenciais com imagem + copy curta e legível.
6. Galeria com grid dinâmico que preserve ritmo visual.
7. Localização com endereço, horários e CTA complementar de agendamento.
8. Footer com links úteis, contato e copyright.
9. Acessibilidade básica: semântica HTML, alt nas imagens e contraste legível.

## Entregáveis

- `app/page.tsx` composto com todas as seções.
- Componentes da homepage implementados em `components/features` e `components/layout`.
- Ponto de entrada visual completo e funcional para a homepage.
- Conteúdo traduzido e alinhado com o tom premium da marca.

## Notas de validação

- Verificar navegação e ancoragem no desktop e mobile.
- Testar a homepage com imagens carregadas e sem imagens.
- Confirmar que os CTAs levam à seção de agendamento ou à página de login/admin correta.

## Referências

- HTML original do Stitch: https://stitch.withgoogle.com/projects/10609284384409249817
- Design system: `DESIGN.md`
- Tailwind config: `tailwind.config.ts`
