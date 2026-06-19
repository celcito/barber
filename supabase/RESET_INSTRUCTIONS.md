# Reset do Banco de Dados

## Problema
O banco de dados pode ter dados inconsistentes de testes anteriores.

## Solução: Reset Completo

### Passo 1: Executar o SQL de Reset

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `20250618_reset_database.sql`
6. Clique em **Run**

### Passo 2: Criar Nova Conta

Após o reset:

1. **Faça logout** da aplicação
2. Acesse a página de **Cadastro** (ou clique em "Não tenho conta" no login)
3. Cadastre-se com um **novo email** (ex: `seuemail@exemplo.com`)
4. **Não use** o email `teste@barbearia.com` - esse pode ter problemas

### Passo 3: O que será criado automaticamente

Ao criar a conta, o trigger `handle_new_user` vai criar:

- ✅ Salão com nome "Meu Salão"
- ✅ Slug automático (ex: `salao-abc123`)
- ✅ Horários padrão (segunda a sábado 09:00-19:00, domingo fechado)
- ✅ 1 Profissional "Barbeiro" com horários
- ✅ 3 Serviços: Corte (R$45), Barba (R$30), Corte+Barba (R$65)

### Passo 4: Configurar seu salão

1. Faça login com seu novo email
2. Acesse **Configurações** (/dashboard/configuracoes)
3. Altere o nome do salão
4. Altere o slug (este será seu link de agendamento)
5. Configure horários, WhatsApp, redes sociais

### Passo 5: Testar Agendamento

1. Acesse `localhost:3000/{seu-slug}` ou `seusite.com/{seu-slug}`
2. Faça um agendamento de teste
3. Veja se aparece na agenda do dashboard

---

## Se preferir manter o usuário atual

Se você quiser continuar usando `teste@barbearia.com`, após fazer o reset:

1. Faça login com `teste@barbearia.com` 
2. Acesse `/seed` para criar os dados iniciais para esse usuário

Mas é **recomendado** criar uma conta nova para evitar problemas.
