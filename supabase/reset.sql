-- ============================================================
-- RESET COMPLETO — AgendaFácil
-- Rode no Supabase Dashboard → SQL Editor → New Query
-- Apaga TUDO (auth + public) e deixa pronto para migration + seed
-- ============================================================

-- 1. Desabilitar trigger antes de mexer em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- 2. Limpar auth (ordem importa por causa de FKs)
TRUNCATE auth.identities CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.mfa_factors CASCADE;
TRUNCATE auth.mfa_challenges CASCADE;
TRUNCATE auth.users CASCADE;

-- 3. Limpar public
DROP TABLE IF EXISTS public.horario_excessoes CASCADE;
DROP TABLE IF EXISTS public.agendamentos CASCADE;
DROP TABLE IF EXISTS public.profissional_horarios CASCADE;
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.profissionais CASCADE;
DROP TABLE IF EXISTS public.saloes CASCADE;
DROP TYPE IF EXISTS public.agendamento_status CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 4. Confirmar limpeza
SELECT 'reset ok' AS status,
       (SELECT count(*) FROM auth.users) AS users,
       (SELECT count(*) FROM public.saloes) AS saloes;
