DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_salao_id UUID;
  v_prof1_id UUID;
  v_prof2_id UUID;
  v_serv1_id UUID;
  v_serv2_id UUID;
  v_serv3_id UUID;
BEGIN
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone_confirmed_at)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'teste@agendafacil.com.br', crypt('Teste123!', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"nome": "Barbearia Teste"}', now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'teste@agendafacil.com.br'), 'email', v_user_id::text, now(), now(), now())
  ON CONFLICT DO NOTHING;

  v_salao_id := v_user_id;

  INSERT INTO public.profissionais (salao_id, nome, ativo) VALUES (v_salao_id, 'Carlos', true) RETURNING id INTO v_prof1_id;
  INSERT INTO public.profissionais (salao_id, nome, ativo) VALUES (v_salao_id, 'Fernando', true) RETURNING id INTO v_prof2_id;

  INSERT INTO public.profissional_horarios (profissional_id, dia_semana, aberto, inicio, fim) VALUES
    (v_prof1_id, 'segunda-feira', true, '08:00', '18:00'),
    (v_prof1_id, 'terça-feira', true, '08:00', '18:00'),
    (v_prof1_id, 'quarta-feira', true, '08:00', '18:00'),
    (v_prof1_id, 'quinta-feira', true, '08:00', '18:00'),
    (v_prof1_id, 'sexta-feira', true, '08:00', '18:00'),
    (v_prof1_id, 'sábado', true, '08:00', '12:00'),
    (v_prof1_id, 'domingo', false, '08:00', '18:00'),
    (v_prof2_id, 'segunda-feira', true, '10:00', '20:00'),
    (v_prof2_id, 'terça-feira', true, '10:00', '20:00'),
    (v_prof2_id, 'quarta-feira', true, '10:00', '20:00'),
    (v_prof2_id, 'quinta-feira', true, '10:00', '20:00'),
    (v_prof2_id, 'sexta-feira', true, '10:00', '20:00'),
    (v_prof2_id, 'sábado', true, '09:00', '15:00'),
    (v_prof2_id, 'domingo', false, '10:00', '20:00');

  INSERT INTO public.servicos (salao_id, nome, duracao_min, preco) VALUES
    (v_salao_id, 'Corte', 30, 45.00) RETURNING id INTO v_serv1_id;
  INSERT INTO public.servicos (salao_id, nome, duracao_min, preco) VALUES
    (v_salao_id, 'Barba', 20, 30.00) RETURNING id INTO v_serv2_id;
  INSERT INTO public.servicos (salao_id, nome, duracao_min, preco) VALUES
    (v_salao_id, 'Corte + Barba', 45, 65.00) RETURNING id INTO v_serv3_id;

  INSERT INTO public.agendamentos (salao_id, profissional_id, servico_id, cliente_nome, cliente_email, cliente_whatsapp, inicio, fim, status)
  VALUES
    (v_salao_id, v_prof1_id, v_serv1_id, 'João Silva', 'joao@email.com', '(11) 99999-0001', now() + interval '1 day' + interval '9 hours', now() + interval '1 day' + interval '9 hours' + interval '30 minutes', 'confirmado'),
    (v_salao_id, v_prof1_id, v_serv3_id, 'Maria Santos', 'maria@email.com', '(11) 99999-0002', now() + interval '1 day' + interval '10 hours', now() + interval '1 day' + interval '10 hours' + interval '45 minutes', 'confirmado'),
    (v_salao_id, v_prof2_id, v_serv2_id, 'Pedro Alves', 'pedro@email.com', '(11) 99999-0003', now() + interval '2 days' + interval '14 hours', now() + interval '2 days' + interval '14 hours' + interval '20 minutes', 'pendente'),
    (v_salao_id, v_prof2_id, v_serv1_id, 'Ana Costa', 'ana@email.com', '(11) 99999-0004', now() + interval '2 days' + interval '15 hours', now() + interval '2 days' + interval '15 hours' + interval '30 minutes', 'confirmado'),
    (v_salao_id, v_prof1_id, v_serv1_id, 'Lucas Oliveira', 'lucas@email.com', '(11) 99999-0005', now() + interval '3 days' + interval '11 hours', now() + interval '3 days' + interval '11 hours' + interval '30 minutes', 'cancelado');
END $$;
