-- Atualizar trigger para semear dados padrão ao criar novo usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_salao_id UUID := NEW.id;
  v_profissional_id UUID;
BEGIN
  -- Criar salão com config padrão
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

  -- Criar profissional padrão
  INSERT INTO public.profissionais (salao_id, nome, ativo)
  VALUES (v_salao_id, 'Barbeiro', true)
  RETURNING id INTO v_profissional_id;

  -- Criar horários do profissional (mesmos do salão)
  INSERT INTO public.profissional_horarios (profissional_id, dia_semana, aberto, inicio, fim)
  VALUES
    (''||v_profissional_id, 'segunda-feira', true, '09:00', '19:00'),
    (''||v_profissional_id, 'terça-feira', true, '09:00', '19:00'),
    (''||v_profissional_id, 'quarta-feira', true, '09:00', '19:00'),
    (''||v_profissional_id, 'quinta-feira', true, '09:00', '19:00'),
    (''||v_profissional_id, 'sexta-feira', true, '09:00', '19:00'),
    (''||v_profissional_id, 'sábado', true, '09:00', '14:00'),
    (''||v_profissional_id, 'domingo', false, '09:00', '19:00');

  -- Criar serviços padrão
  INSERT INTO public.servicos (salao_id, nome, duracao_min, preco)
  VALUES
    (v_salao_id, 'Corte', 30, 45.00),
    (v_salao_id, 'Barba', 20, 30.00),
    (v_salao_id, 'Corte + Barba', 45, 65.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
