-- Backfill: marca como atendido agendamentos passados
-- Executado em migration separada porque ADD VALUE e UPDATE
-- com o novo valor não podem estar na mesma transação (PG 55P04)
UPDATE agendamentos
SET status = 'atendido'
WHERE status IN ('confirmado', 'pendente') AND fim < NOW();
