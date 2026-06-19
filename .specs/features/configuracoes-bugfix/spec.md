# Configuracoes (Dashboard) — Feature Specification

## Visao Geral

Pagina de configuracoes do dashboard administrativo. Permite ao dono da barbearia gerenciar perfil do estabelecimento, horarios, endereco, contato, redes sociais, notificacoes e excecoes de horario.

**URL**: `/dashboard/configuracoes`
**Componente**: `app/dashboard/configuracoes/page.tsx`
**Server action**: `lib/actions/salao.ts` (`getSalao()`, `updateSalao()`)

---

## Secoes da Pagina

| Secao | Campos | Storage |
|-------|--------|---------|
| **Perfil da Barbearia** | Nome, Link de Agendamento (slug) | `saloes.nome`, `saloes.slug` |
| **Horarios de Funcionamento** | 7 dias: aberto/fechado + inicio/fim | `saloes.config.horarios` (JSONB) |
| **Endereco** | Logradouro, numero, complemento, bairro, cidade, estado, CEP (ViaCEP) | `saloes.endereco` (JSONB) |
| **WhatsApp** | Telefone, toggle notificar dono | `saloes.whatsapp`, `config.notificacoes.notificar_dono` |
| **Redes Sociais** | Instagram, Facebook, TikTok, Website | `saloes.config.redes_sociais` (JSONB) |
| **Intervalo** | 15/20/30/45/60 min | `saloes.config.intervalo` |
| **Lembretes** | WhatsApp on/off, Email on/off, intervalo, template | `saloes.config.notificacoes` (JSONB) |
| **Excecoes de Horario** | Criar/remover periodos bloqueados ou abertos | `horario_excessoes` table |

---

## Fluxo de Salvamento

1. Usuario clica "Salvar Alteracoes" (botao fora do form, atributo `form="settings-form"`)
2. `handleSave()` cria `FormData` do form element
3. Chama `updateSalao(formData)` (server action)
4. Server action valida nome/slug/whatsapp com Zod
5. Monta objeto `configFinal` com horarios + intervalo + redes_sociais + notificacoes
6. Monta objeto `endereco` com campos do endereco
7. Da `UPDATE` na tabela `saloes` via Supabase
8. Se erro, retorna `{ error }`; se sucesso, retorna `{ success: true }`
9. Frontend recarrega dados via `loadSalao()` e exibe mensagem de sucesso

---

## Bugs Conhecidos

### B1: Checkboxes sempre salvam como `false`

**Causa**: Hidden input `<input type="hidden" value="false">` vem ANTES do checkbox no DOM. Quando o checkbox esta marcado, `formData.get()` retorna o primeiro valor ("false").

**Arquivos**:
- `app/dashboard/configuracoes/page.tsx` — hidden inputs nas linhas ~282, ~459, ~573, ~587
- `lib/actions/salao.ts` — `formData.get() === "true"` nas linhas ~45, ~84, ~85, ~88

**Afeta**: Todos os 7 checkboxes de horario, toggle notificar_dono, toggle lembretes_ativos, toggle lembretes_email_ativos.

**Fix**: Remover hidden inputs + usar `formData.has()` no server action.

### B2: Nome e Slug nao persistem

**Causa Raiz**: Validacao do WhatsApp (`salaoSchema`) falha silenciosamente, bloqueando todo o save. O regex do WhatsApp (`^\(\d{2}\) \d{4,5}-\d{4}$`) nao aceita o formato com `+55` que aparece no placeholder do input (`+55 (11) 99999-9999`). Como o Zod usa `safeParse()`, a falha retorna erros de campo que nao eram exibidos no formulario — o usuario clica "Salvar", a validacao inteira aborta, e nem nome nem slug persistem.

**Fix**:
- (a) Relaxar regex do WhatsApp para aceitar `+55` opcional e espacos
- (b) Exibir `errors.nome`, `errors.slug`, `errors.whatsapp` no template
- (c) Revalidar a pagina publica (`/[slug]`) apos salvar

---

## Dados no Banco

### Tabela: `saloes`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID PK | Mesmo ID do `auth.users` (1:1) |
| nome | TEXT | Nome do estabelecimento |
| slug | TEXT UNIQUE | Link de agendamento (ex: `minha-barbearia`) |
| whatsapp | TEXT | Telefone WhatsApp |
| endereco | JSONB | `{ logradouro, numero, complemento, bairro, cidade, estado, cep }` |
| config | JSONB | `{ horarios, intervalo, redes_sociais, notificacoes }` |
| ativo | BOOLEAN | Se o salao esta ativo |

### Exemplo de `config` (JSONB):

```json
{
  "horarios": {
    "segunda-feira": {"aberto": true, "inicio": "09:00", "fim": "19:00"},
    "sabado": {"aberto": true, "inicio": "09:00", "fim": "14:00"},
    "domingo": {"aberto": false, "inicio": "09:00", "fim": "19:00"}
  },
  "intervalo": 30,
  "redes_sociais": {
    "instagram": "@barbearia",
    "facebook": "fb.com/barbearia",
    "tiktok": "",
    "website": ""
  },
  "notificacoes": {
    "lembretes_ativos": true,
    "lembretes_email_ativos": false,
    "intervalo_lembrete": 120,
    "template": "Ola {{nome}}, lembrete do seu horario hoje as {{horario}} para {{servico}} no {{salao}}.",
    "notificar_dono": true
  }
}
```

### Tabela: `horario_excessoes`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID PK | |
| salao_id | UUID FK | FK -> saloes.id |
| data_inicio | TIMESTAMPTZ | Inicio do periodo excepcional |
| data_fim | TIMESTAMPTZ | Fim do periodo excepcional |
| tipo | TEXT | `bloqueado` ou `aberto_excessao` |
| descricao | TEXT | Motivo |

---

## RLS Policies

```sql
CREATE POLICY "saloes_select_own" ON saloes FOR SELECT USING (id = auth.uid());
CREATE POLICY "saloes_update_own" ON saloes FOR UPDATE USING (id = auth.uid());
CREATE POLICY "saloes_public_select" ON saloes FOR SELECT USING (true);
```

**Nota**: Nao ha policy de INSERT para saloes — a criacao e feita pelo trigger `handle_new_user()` (SECURITY DEFINER).

---

## Goals

- [x] Corrigir bug dos checkboxes (B1)
- [x] Corrigir bug do nome/slug (B2 — causa: regex WhatsApp + sem feedback de erro)
- [x] Exibir feedback de validação na tela (banner de erros + erros por campo)
- [x] Revalidar página pública /[slug] apos save
- [x] Criar suite de testes E2E com Playwright
- [x] Garantir que todas as seções salvam e persistem corretamente

---

## User Stories

### P1: Corrigir salvamento de checkboxes ⭐ MVP

**Acceptance Criteria**:

1. WHEN administrador marca "Aberto" de um dia E salva, THEN `config.horarios[dia].aberto` = `true` no banco
2. WHEN administrador desmarca "Aberto" de um dia E salva, THEN `config.horarios[dia].aberto` = `false` no banco
3. WHEN administrador ativa "Notificar novos agendamentos" E salva, THEN `notificar_dono` = `true`
4. WHEN administrador ativa "Lembretes WhatsApp" E salva, THEN `lembretes_ativos` = `true`
5. WHEN administrador ativa "Lembretes Email" E salva, THEN `lembretes_email_ativos` = `true`

### P1: Corrigir salvamento de nome e slug ⭐ MVP

**Acceptance Criteria**:

6. WHEN administrador altera o nome E salva, THEN `saloes.nome` persiste no banco
7. WHEN administrador altera o slug E salva, THEN `saloes.slug` persiste no banco
8. WHEN administrador altera endereco E salva, THEN `saloes.endereco` persiste no banco
9. WHEN administrador altera redes sociais E salva, THEN `config.redes_sociais` persiste no banco
10. WHEN administrador altera WhatsApp E salva, THEN `saloes.whatsapp` persiste no banco

### P2: Testes E2E

**Acceptance Criteria**:

11. WHEN `npx playwright test` executa, THEN todos os cenarios passam
12. Testes cobrem: login → config → alterar nome/slug/horarios/endereco/redes/whatsapp/intervalo/notificacoes → salvar → reload → verificar persistencia

---

## Edge Cases

- WHEN slug ja existe no banco THEN sistema SHALL retornar erro de unicidade
- WHEN slug tem uppercase THEN validacao HTML5 `pattern` bloqueia submit
- WHEN whatsapp em formato invalido THEN Zod rejeita e server action retorna erro
- WHEN CEP preenchido THEN ViaCEP auto-preenche logradouro/bairro/cidade/estado
- WHEN todos os campos de endereco estao vazios THEN salva como `{}` no JSONB

---

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| CONF-01 | Fix checkboxes horario | Done |
| CONF-02 | Fix checkboxes notificacao | Done |
| CONF-03 | Fix nome/slug save (causa: regex whatsapp) | Done |
| CONF-04 | Fix endereco/redes/whatsapp save | Done |
| CONF-05 | Exibir erros de campo no form | Done |
| CONF-06 | Revalidar pagina publica apos save | Done |
| CONF-07 | Setup Playwright | Done |
| CONF-08 | E2E tests configuracoes | Done |
| CONF-09 | Feedback de validacao visivel (banner+inline) | Done |
| CONF-10 | Debug test route | Done |

---

## Success Criteria

- [x] Todos os checkboxes salvam true/false corretamente
- [x] Nome, slug, endereco, redes sociais, whatsapp, intervalo persistem
- [x] Erros de validacao sao exibidos visualmente no form (banner + inline)
- [x] Pagina publica /[slug] reflete apos salvar
- [x] `npx playwright test` passa 100%
