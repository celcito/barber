#!/usr/bin/env node
/**
 * Popula o Supabase remoto com o usuário de teste e dados de exemplo.
 *
 *   node scripts/seed.mjs
 *
 * Requer no .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
if (!URL || !KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY no .env.local");
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const EMAIL = "teste@barbearia.com";
const PASSWORD = "123456";

const configSalao = {
  horarios: {
    "segunda-feira": { aberto: true, inicio: "09:00", fim: "19:00" },
    "terça-feira":   { aberto: true, inicio: "09:00", fim: "19:00" },
    "quarta-feira":  { aberto: true, inicio: "09:00", fim: "19:00" },
    "quinta-feira":  { aberto: true, inicio: "09:00", fim: "19:00" },
    "sexta-feira":   { aberto: true, inicio: "09:00", fim: "19:00" },
    "sábado":        { aberto: true, inicio: "09:00", fim: "14:00" },
    "domingo":       { aberto: false, inicio: "09:00", fim: "19:00" },
  },
  intervalo: 30,
  redes_sociais: { instagram: "", facebook: "", tiktok: "", website: "" },
  notificacoes: {
    lembretes_ativos: true,
    lembretes_email_ativos: false,
    intervalo_lembrete: 120,
    template: "Olá {{nome}}, lembrete do seu horário hoje às {{horario}} para {{servico}} no {{salao}}.",
    notificar_dono: true,
  },
};

const inHours = (h) => {
  const d = new Date();
  d.setHours(d.getHours() + Math.floor(h), Math.round((h % 1) * 60), 0, 0);
  return d.toISOString();
};

async function main() {
  const { data: list } = await sb.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === EMAIL);
  if (existing) {
    console.log("→ removendo usuário existente:", existing.id);
    await sb.from("agendamentos").delete().eq("salao_id", existing.id);
    const { data: profs } = await sb.from("profissionais").select("id").eq("salao_id", existing.id);
    if (profs?.length) {
      await sb.from("profissional_horarios").delete().in("profissional_id", profs.map((p) => p.id));
    }
    await sb.from("profissionais").delete().eq("salao_id", existing.id);
    await sb.from("servicos").delete().eq("salao_id", existing.id);
    await sb.from("horario_excessoes").delete().eq("salao_id", existing.id);
    await sb.from("saloes").delete().eq("id", existing.id);
    await sb.auth.admin.deleteUser(existing.id);
  }

  // Limpar qualquer salão órfão com o mesmo slug (defesa em profundidade)
  const { data: orphan } = await sb.from("saloes").select("id").eq("slug", "barbearia-teste");
  for (const o of orphan ?? []) {
    console.log("→ removendo salão órfão:", o.id);
    await sb.from("saloes").delete().eq("id", o.id);
  }

  console.log("→ criando usuário via admin API (trigger cria salão padrão)");
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { nome: "Barbearia Teste" },
  });
  if (createErr) throw createErr;
  const SALAO_ID = created.user.id;
  console.log("✓ user:", SALAO_ID);

  const { error: e1 } = await sb.from("saloes").update({
    nome: "Barbearia Teste",
    slug: "barbearia-teste",
    config: configSalao,
  }).eq("id", SALAO_ID);
  if (e1) throw e1;
  console.log("✓ salão atualizado");

  const { data: oldProfs } = await sb.from("profissionais").select("id").eq("salao_id", SALAO_ID);
  if (oldProfs?.length) {
    await sb.from("profissional_horarios").delete().in("profissional_id", oldProfs.map((p) => p.id));
  }
  await sb.from("profissionais").delete().eq("salao_id", SALAO_ID);

  const { data: p1, error: e2 } = await sb.from("profissionais")
    .insert({ salao_id: SALAO_ID, nome: "Carlos", ativo: true }).select().single();
  if (e2) throw e2;
  const { data: p2, error: e3 } = await sb.from("profissionais")
    .insert({ salao_id: SALAO_ID, nome: "Fernando", ativo: true }).select().single();
  if (e3) throw e3;
  console.log("✓ profissionais:", p1.nome, p2.nome);

  const horarios = [
    ...["segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira"].map((d) => ({ profissional_id: p1.id, dia_semana: d, aberto: true, inicio: "08:00", fim: "18:00" })),
    { profissional_id: p1.id, dia_semana: "sábado",  aberto: true,  inicio: "08:00", fim: "12:00" },
    { profissional_id: p1.id, dia_semana: "domingo", aberto: false, inicio: "08:00", fim: "18:00" },
    ...["segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira"].map((d) => ({ profissional_id: p2.id, dia_semana: d, aberto: true, inicio: "10:00", fim: "20:00" })),
    { profissional_id: p2.id, dia_semana: "sábado",  aberto: true,  inicio: "09:00", fim: "15:00" },
    { profissional_id: p2.id, dia_semana: "domingo", aberto: false, inicio: "10:00", fim: "20:00" },
  ];
  const { error: e4 } = await sb.from("profissional_horarios").insert(horarios);
  if (e4) throw e4;
  console.log(`✓ ${horarios.length} profissional_horarios`);

  const { data: servs } = await sb.from("servicos").select("id, nome").eq("salao_id", SALAO_ID);
  const s1 = servs.find((s) => s.nome === "Corte")?.id;
  const s2 = servs.find((s) => s.nome === "Barba")?.id;
  const s3 = servs.find((s) => s.nome === "Corte + Barba")?.id;
  if (!s1 || !s2 || !s3) throw new Error("Serviços padrão não criados pelo trigger");

  await sb.from("agendamentos").delete().eq("salao_id", SALAO_ID);
  const ags = [
    { salao_id: SALAO_ID, profissional_id: p1.id, servico_id: s1, cliente_nome: "João Silva",    cliente_email: "joao@email.com",  cliente_whatsapp: "(11) 99999-0001", inicio: inHours(2),  fim: inHours(2.5),  status: "confirmado" },
    { salao_id: SALAO_ID, profissional_id: p1.id, servico_id: s3, cliente_nome: "Maria Santos",  cliente_email: "maria@email.com", cliente_whatsapp: "(11) 99999-0002", inicio: inHours(4),  fim: inHours(4.75), status: "confirmado" },
    { salao_id: SALAO_ID, profissional_id: p2.id, servico_id: s2, cliente_nome: "Pedro Alves",   cliente_email: "pedro@email.com", cliente_whatsapp: "(11) 99999-0003", inicio: inHours(26), fim: inHours(26.4), status: "pendente"   },
    { salao_id: SALAO_ID, profissional_id: p2.id, servico_id: s1, cliente_nome: "Ana Costa",     cliente_email: "ana@email.com",   cliente_whatsapp: "(11) 99999-0004", inicio: inHours(28), fim: inHours(28.5), status: "confirmado" },
    { salao_id: SALAO_ID, profissional_id: p1.id, servico_id: s1, cliente_nome: "Lucas Oliveira", cliente_email: "lucas@email.com",cliente_whatsapp: "(11) 99999-0005", inicio: inHours(50), fim: inHours(50.5), status: "cancelado"  },
  ];
  const { error: e5 } = await sb.from("agendamentos").insert(ags);
  if (e5) throw e5;
  console.log(`✓ ${ags.length} agendamentos`);

  console.log("\n=== SEED COMPLETO ===");
  console.log("Login: teste@barbearia.com / 123456");
  console.log("Slug:  /barbearia-teste");
}

main().catch((e) => { console.error("FALHOU:", e); process.exit(1); });
