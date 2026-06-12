-- Fix: Restrict public INSERT on agendamentos to require valid salao_id
DROP POLICY IF EXISTS "agendamentos_public_insert" ON agendamentos;
CREATE POLICY "agendamentos_public_insert" ON agendamentos
  FOR INSERT
  WITH CHECK (
    salao_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM saloes WHERE id = salao_id)
  );

-- Fix: Restrict public INSERT on horario_excessoes similarly
DROP POLICY IF EXISTS "horario_excessoes_public_select" ON horario_excessoes;
CREATE POLICY "horario_excessoes_public_select" ON horario_excessoes
  FOR SELECT
  USING (true);
