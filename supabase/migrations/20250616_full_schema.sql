DROP TABLE IF EXISTS horario_excessoes CASCADE;
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS profissional_horarios CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS profissionais CASCADE;
DROP TABLE IF EXISTS saloes CASCADE;
DROP TYPE IF EXISTS agendamento_status CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TYPE agendamento_status AS ENUM ('confirmado', 'pendente', 'cancelado');

CREATE TABLE saloes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  ativo BOOLEAN DEFAULT FALSE,
  doc_fiscal JSONB DEFAULT NULL,
  endereco JSONB DEFAULT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id UUID NOT NULL REFERENCES saloes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE
);

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

CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id UUID NOT NULL REFERENCES saloes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  duracao_min INTEGER NOT NULL,
  preco DECIMAL(10,2) NOT NULL
);

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id UUID NOT NULL REFERENCES saloes(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT DEFAULT NULL,
  cliente_whatsapp TEXT NOT NULL,
  inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fim TIMESTAMP WITH TIME ZONE NOT NULL,
  status agendamento_status DEFAULT 'confirmado',
  lembrete_enviado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE horario_excessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id UUID NOT NULL REFERENCES saloes(id) ON DELETE CASCADE,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('bloqueado', 'aberto_excessao')),
  descricao TEXT DEFAULT '',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profissionais_salao ON profissionais(salao_id);
CREATE INDEX idx_servicos_salao ON servicos(salao_id);
CREATE INDEX idx_agendamentos_salao ON agendamentos(salao_id);
CREATE INDEX idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_inicio ON agendamentos(inicio);
CREATE INDEX idx_profissional_horarios_profissional ON profissional_horarios(profissional_id);
CREATE INDEX idx_horario_excessoes_salao ON horario_excessoes(salao_id);
CREATE INDEX idx_horario_excessoes_data ON horario_excessoes(salao_id, data_inicio, data_fim);

ALTER TABLE saloes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissional_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario_excessoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saloes_select_own" ON saloes FOR SELECT USING (id = auth.uid());
CREATE POLICY "saloes_update_own" ON saloes FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profissionais_select_own" ON profissionais FOR SELECT USING (salao_id = auth.uid());
CREATE POLICY "profissionais_insert_own" ON profissionais FOR INSERT WITH CHECK (salao_id = auth.uid());
CREATE POLICY "profissionais_update_own" ON profissionais FOR UPDATE USING (salao_id = auth.uid());
CREATE POLICY "profissionais_delete_own" ON profissionais FOR DELETE USING (salao_id = auth.uid());

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

CREATE POLICY "servicos_select_own" ON servicos FOR SELECT USING (salao_id = auth.uid());
CREATE POLICY "servicos_insert_own" ON servicos FOR INSERT WITH CHECK (salao_id = auth.uid());
CREATE POLICY "servicos_update_own" ON servicos FOR UPDATE USING (salao_id = auth.uid());
CREATE POLICY "servicos_delete_own" ON servicos FOR DELETE USING (salao_id = auth.uid());

CREATE POLICY "agendamentos_select_own" ON agendamentos FOR SELECT USING (salao_id = auth.uid());
CREATE POLICY "agendamentos_insert_own" ON agendamentos FOR INSERT WITH CHECK (salao_id = auth.uid());
CREATE POLICY "agendamentos_update_own" ON agendamentos FOR UPDATE USING (salao_id = auth.uid());
CREATE POLICY "agendamentos_delete_own" ON agendamentos FOR DELETE USING (salao_id = auth.uid());

CREATE POLICY "horario_excessoes_select_own" ON horario_excessoes FOR SELECT USING (salao_id = auth.uid());
CREATE POLICY "horario_excessoes_insert_own" ON horario_excessoes FOR INSERT WITH CHECK (salao_id = auth.uid());
CREATE POLICY "horario_excessoes_update_own" ON horario_excessoes FOR UPDATE USING (salao_id = auth.uid());
CREATE POLICY "horario_excessoes_delete_own" ON horario_excessoes FOR DELETE USING (salao_id = auth.uid());

CREATE POLICY "saloes_public_select" ON saloes FOR SELECT USING (true);
CREATE POLICY "profissionais_public_select" ON profissionais FOR SELECT USING (true);
CREATE POLICY "profissional_horarios_public_select" ON profissional_horarios FOR SELECT USING (true);
CREATE POLICY "servicos_public_select" ON servicos FOR SELECT USING (true);
CREATE POLICY "agendamentos_public_insert" ON agendamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "horario_excessoes_public_select" ON horario_excessoes FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_salao_id UUID := NEW.id;
  v_profissional_id UUID;
BEGIN
  INSERT INTO public.saloes (id, nome, slug, config, ativo)
  VALUES (
    v_salao_id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Meu Salão'),
    'salao-' || substr(v_salao_id::text, 1, 8),
    '{
      "horarios": {
        "segunda-feira": {"aberto": true, "inicio": "09:00", "fim": "19:00"},
        "terça-feira": {"aberto": true, "inicio": "09:00", "fim": "19:00"},
        "quarta-feira": {"aberto": true, "inicio": "09:00", "fim": "19:00"},
        "quinta-feira": {"aberto": true, "inicio": "09:00", "fim": "19:00"},
        "sexta-feira": {"aberto": true, "inicio": "09:00", "fim": "19:00"},
        "sábado": {"aberto": true, "inicio": "09:00", "fim": "14:00"},
        "domingo": {"aberto": false, "inicio": "09:00", "fim": "19:00"}
      },
      "intervalo": 30,
      "redes_sociais": {"instagram": "", "facebook": "", "tiktok": "", "website": ""},
      "notificacoes": {
        "lembretes_ativos": true,
        "lembretes_email_ativos": false,
        "intervalo_lembrete": 120,
        "template": "Olá {{nome}}, lembrete do seu horário hoje às {{horario}} para {{servico}} no {{salao}}.",
        "notificar_dono": true
      }
    }'::jsonb,
    true
  );

  INSERT INTO public.profissionais (salao_id, nome, ativo)
  VALUES (v_salao_id, 'Barbeiro', true)
  RETURNING id INTO v_profissional_id;

  INSERT INTO public.profissional_horarios (profissional_id, dia_semana, aberto, inicio, fim)
  VALUES
    (v_profissional_id, 'segunda-feira', true, '09:00', '19:00'),
    (v_profissional_id, 'terça-feira', true, '09:00', '19:00'),
    (v_profissional_id, 'quarta-feira', true, '09:00', '19:00'),
    (v_profissional_id, 'quinta-feira', true, '09:00', '19:00'),
    (v_profissional_id, 'sexta-feira', true, '09:00', '19:00'),
    (v_profissional_id, 'sábado', true, '09:00', '14:00'),
    (v_profissional_id, 'domingo', false, '09:00', '19:00');

  INSERT INTO public.servicos (salao_id, nome, duracao_min, preco)
  VALUES
    (v_salao_id, 'Corte', 30, 45.00),
    (v_salao_id, 'Barba', 20, 30.00),
    (v_salao_id, 'Corte + Barba', 45, 65.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
