# Tasks: Disponibilidade por Profissional

## Task 1: Migration SQL
**Status:** Pending
**Depends:** Nenhuma

Criar migration SQL para tabela `profissional_horarios`:
```sql
CREATE TABLE profissional_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  dia_semana TEXT NOT NULL,
  aberto BOOLEAN NOT NULL DEFAULT true,
  inicio TIME NOT NULL DEFAULT '09:00',
  fim TIME NOT NULL DEFAULT '19:00',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profissional_id, dia_semana)
);

-- RLS
ALTER TABLE profissional_horarios ENABLE ROW LEVEL SECURITY;
```

**Verificação:** Tabela criada, RLS habilitado

---

## Task 2: Atualizar Tipos
**Status:** Pending
**Depends:** Task 1

Atualizar `types/database.ts` com a nova tabela `profissional_horarios` (Row, Insert, Update)

**Verificação:** TypeScript compila sem erros

---

## Task 3: Server Actions - CRUD Profissional Horários
**Status:** Pending
**Depends:** Task 2

Criar em `lib/actions/profissionais.ts`:
- `getProfissionalHorarios(profissionalId: string)` - retorna horários do profissional
- `updateProfissionalHorarios(profissionalId: string, horarios: HorarioConfig[])` - upsert horários

**Verificação:** Actions funcionam via Server Action

---

## Task 4: Atualizar Lógica de Cálculo
**Status:** Pending
**Depends:** Task 3

Modificar `lib/actions/public.ts` - `getHorariosDisponiveis()`:

1. Se `profissionalId` fornecido:
   - Buscar `profissional_horarios` do profissional
   - Se não existir → usar `config.horarios` do salão
   - Gerar slots normalmente

2. Se `profissionalId` null ("Sem preferência"):
   - Buscar todos os profissionais ativos
   - Para cada profissional, calcular seus slots
   - Combinar e retornar apenas o **primeiro profissional** para cada horário
   - Retornar: `[{ horario: "09:00", profissionalId: "uuid", profissionalNome: "João" }]`

**Verificação:** Testar com dados reais

---

## Task 5: UI Booking - Step Time
**Status:** Pending
**Depends:** Task 4

Atualizar `components/booking/step-time.tsx`:
- Receber nova estrutura de dados (com profissional)
- Exibir nome do profissional quando "Sem preferência"
- Atualizar `booking-flow.tsx` para armazenar profissional selecionado automaticamente

**Verificação:** Fluxo público funciona corretamente

---

## Task 6: UI Admin - Formulário Profissional
**Status:** Pending
**Depends:** Task 3

Atualizar `components/features/profissional-form.tsx`:
- Adicionar toggle "Usar horários do salão" (padrão: true)
- Quando false, mostrar configuração por dia da semana
- Salvar via `updateProfissionalHorarios()`

**Verificação:** Admin consegue configurar horários por profissional

---

## Task 7: Testes e Validação
**Status:** Pending
**Depends:** Todas anteriores

- Testar fluxo completo de agendamento
- Testar "Sem preferência" retorna profissional mais próximo
- Testar herança de horários
- Verificar que slots ocupados não aparecem

**Verificação:** Todos os cenários funcionam
