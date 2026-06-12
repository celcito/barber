# Feature: Disponibilidade por Profissional

## Visão Geral
Implementar sistema de disponibilidade individual por profissional, permitindo que cada profissional tenha seus próprios horários de funcionamento (herdando do salão por padrão com opção de exceções). Quando o cliente não escolher profissional ("Sem preferência"), o sistema deve retornar apenas o primeiro slot disponível de cada horário entre todos os profissionais.

## Requisitos

### REQ-01: Tabela de Disponibilidade
Criar tabela `profissional_horarios` no Supabase:
- `id` UUID (PK)
- `profissional_id` UUID (FK → profissionais.id)
- `dia_semana` text (ex: "segunda-feira")
- `aberto` boolean
- `inicio` time
- `fim` time
- `criado_em` timestamp

### REQ-02: Lógica de Herança
- Por padrão, profissional herda horários do salão
- Admin pode configurar exceções por profissional (dias específicos)
- Se não houver configuração para o profissional, usar horários do salão

### REQ-03: Cálculo de Slots
**Com profissional selecionado:**
- Buscar `profissional_horarios` do profissional
- Se não existir → usar `config.horarios` do salão
- Gerar slots respeitando abertura/fechamento, duração do serviço, intervalo, exceções e agendamentos existentes

**Sem preferência (profissionalId = null):**
- Para cada profissional ativo, calcular seus slots disponíveis
- Retornar apenas o **primeiro profissional disponível** para cada slot temporal
- Formato de retorno: array com `{ horario, profissionalId, profissionalNome }`

### REQ-04: UI Admin - Configuração por Profissional
Adicionar seção "Horários de Funcionamento" no formulário de profissional:
- Aba/toggle "Usar horários do salão" (padrão: marcado)
- Quando desmarcado, mostrar configuração por dia da semana (igual ao salão)
- Interface: checkbox aberto + inputs hora início/fim

### REQ-05: Atualização do Booking Flow
Atualizar `step-time.tsx` para:
- Receber nova estrutura de dados (com profissional)
- Exibir nome do profissional ao lado do horário quando "Sem preferência"

## Arquivos a Modificar

### Migration SQL
- `supabase/migrations/` - nova migration

### Server Actions
- `lib/actions/public.ts` - `getHorariosDisponiveis()`
- `lib/actions/profissionais.ts` - novas actions CRUD

### Tipos
- `types/database.ts` - adicionar tabela `profissional_horarios`

### UI Booking
- `components/booking/step-time.tsx` - exibir profissional

### UI Admin
- `components/features/profissional-form.tsx` - seção de horários

## Ordem de Execução

1. **Migration SQL** - Criar tabela + dados iniciais
2. **Tipos** - Atualizar database.ts
3. **Server Actions** - Implementar lógica de cálculo
4. **UI Booking** - Atualizar step-time
5. **UI Admin** - Adicionar configuração de horários

## Dados de Teste
- Criar 2 profissionais com horários diferentes
- Verificar que "Sem preferência" retorna apenas 1 slot por horário
- Verificar que profissional com horário próprio é respeitado
- Verificar herança correta quando não há configuração própria
