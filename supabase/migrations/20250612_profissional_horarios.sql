CREATE TABLE profissional_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  dia_semana TEXT NOT NULL,
  aberto BOOLEAN NOT NULL DEFAULT true,
  inicio TIME NOT NULL DEFAULT '09:00',
  fim TIME NOT NULL DEFAULT '19:00',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profissional_id, dia_semana)
);

CREATE INDEX idx_profissional_horarios_profissional ON profissional_horarios(profissional_id);

ALTER TABLE profissional_horarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profissional_horarios_select_own" ON profissional_horarios
  FOR SELECT USING (profissional_id IN (
    SELECT id FROM profissionais WHERE salao_id = auth.uid()
  ));
CREATE POLICY "profissional_horarios_insert_own" ON profissional_horarios
  FOR INSERT WITH CHECK (profissional_id IN (
    SELECT id FROM profissionais WHERE salao_id = auth.uid()
  ));
CREATE POLICY "profissional_horarios_update_own" ON profissional_horarios
  FOR UPDATE USING (profissional_id IN (
    SELECT id FROM profissionais WHERE salao_id = auth.uid()
  ));
CREATE POLICY "profissional_horarios_delete_own" ON profissional_horarios
  FOR DELETE USING (profissional_id IN (
    SELECT id FROM profissionais WHERE salao_id = auth.uid()
  ));

CREATE POLICY "profissional_horarios_public_select" ON profissional_horarios
  FOR SELECT USING (true);
