import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DIAS_SEMANA_MAP } from "@/lib/schemas/agendamento";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const profissionalId = formData.get("profissional_id") as string | null;
  const servicoId = formData.get("servico_id") as string;
  const data = formData.get("data") as string;

  if (!servicoId || !data) {
    return NextResponse.json({ slots: [] });
  }

  const { data: salaoConfig } = await supabase
    .from("saloes")
    .select("config")
    .eq("id", user.id)
    .single();

  const config = (salaoConfig?.config ?? {}) as Record<string, unknown>;
  const horariosConf = (config.horarios ?? {}) as Record<
    string,
    { aberto: boolean; inicio: string; fim: string }
  >;
  const intervalo = (config.intervalo ?? 30) as number;

  const dataObj = new Date(data + "T12:00:00");
  const diaSemana = dataObj.getDay();
  const diaNome = Object.entries(DIAS_SEMANA_MAP).find(
    ([, v]) => v === diaSemana
  )?.[0];
  if (!diaNome) return NextResponse.json({ slots: [] });

  let horariosUsar = horariosConf;

  if (profissionalId) {
    const { data: profHorarios } = await supabase
      .from("profissional_horarios")
      .select("dia_semana, aberto, inicio, fim")
      .eq("profissional_id", profissionalId);

    if (profHorarios && profHorarios.length > 0) {
      const map: Record<string, { aberto: boolean; inicio: string; fim: string }> = {};
      for (const h of profHorarios) {
        map[h.dia_semana] = { aberto: h.aberto, inicio: h.inicio, fim: h.fim };
      }
      horariosUsar = map;
    }
  }

  if (!horariosUsar[diaNome] || !horariosUsar[diaNome].aberto) {
    return NextResponse.json({ slots: [] });
  }

  const configDia = horariosUsar[diaNome];

  const { data: servico } = await supabase
    .from("servicos")
    .select("duracao_min")
    .eq("id", servicoId)
    .single();

  if (!servico) return NextResponse.json({ slots: [] });

  const duracaoMin = servico.duracao_min;
  const dataInicioDia = `${data}T00:00:00`;
  const dataFimDia = `${data}T23:59:59`;

  const { data: excessos } = await supabase
    .from("horario_excessoes")
    .select("data_inicio, data_fim, tipo")
    .eq("salao_id", user.id)
    .or(`and(data_inicio.lte.${dataFimDia}),and(data_fim.gte.${dataInicioDia})`);

  const excessosBloqueio = (excessos ?? []).filter(
    (e: { tipo: string }) => e.tipo === "bloqueado"
  );

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("inicio, fim, profissional_id")
    .eq("salao_id", user.id)
    .eq("status", "confirmado")
    .gte("inicio", `${data}T00:00:00`)
    .lt("inicio", `${data}T23:59:59`);

  const ocupados = (agendamentos ?? [])
    .filter((a: { profissional_id: string | null }) => !profissionalId || a.profissional_id === profissionalId)
    .map((a: { inicio: string; fim: string }) => ({
      inicio: new Date(a.inicio).getTime(),
      fim: new Date(a.fim).getTime(),
    }));

  const abertura = new Date(`${data}T${configDia.inicio}`).getTime();
  const fechamento = new Date(`${data}T${configDia.fim}`).getTime();

  function slotOcupado(slotInicio: number, slotFim: number) {
    return ocupados.some((o) => slotInicio < o.fim && slotFim > o.inicio);
  }

  function slotBloqueado(slotInicio: number, slotFim: number) {
    return excessosBloqueio.some((exc) => {
      const excInicio = new Date(exc.data_inicio).getTime();
      const excFim = new Date(exc.data_fim).getTime();
      return slotInicio < excFim && slotFim > excInicio;
    });
  }

  const slots: { horario: string }[] = [];
  let atual = abertura;

  while (atual + duracaoMin * 60000 <= fechamento) {
    const slotFim = atual + duracaoMin * 60000;

    if (!slotOcupado(atual, slotFim) && !slotBloqueado(atual, slotFim)) {
      const d = new Date(atual);
      const horario = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      slots.push({ horario });
    }

    atual += intervalo * 60000;
  }

  return NextResponse.json({ slots });
}
