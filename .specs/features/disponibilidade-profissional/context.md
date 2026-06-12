# Context: Disponibilidade por Profissional

## Decisões do Usuário

### 1. Lógica "Sem preferência"
**Escolha:** Apenas primeiro por slot

**Quando cliente não escolhe profissional:**
- Sistema retorna **apenas 1 opção** por horário temporal
- Ex: se há 3 profissionais livres às 09:00, retorna apenas o primeiro
- Objetivo: evitar sobreposição e mostrar agenda mais próxima

### 2. Configuração de Horários
**Escolha:** Herdar do salão + exceções

**Comportamento:**
- Por padrão, profissional herda horários do salão (`config.horarios`)
- Admin pode configurar **exceções** por profissional (dias específicos)
- Ex: profissional X trabalha segunda 09-17, mas terça 10-20 (diferente do salão)

**Fluxo:**
1. Buscar `profissional_horarios` do profissional
2. Se não existir → usar `config.horarios` do salão
3. Se existir → usar configuração do profissional

### 3. Estrutura de Retorno (Sem preferência)
```typescript
interface HorarioDisponivel {
  horario: string;           // "09:00"
  profissionalId: string;    // UUID do profissional
  profissionalNome: string;  // "João"
}
```

## Perguntas Pendentes
Nenhuma

## Restrições Técnicas
- Supabase (PostgreSQL)
- Next.js Server Actions
- RLS (Row Level Security)
- Multi-tenant via salao_id
