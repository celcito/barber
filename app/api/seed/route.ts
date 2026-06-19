import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Erro de autenticação: " + authError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Não autenticado. Faça login primeiro." }, { status: 401 });
    }

    console.log("User ID:", user.id);

    const { data: profissionais, error: selectError } = await supabase
      .from("profissionais")
      .select("id")
      .eq("salao_id", user.id)
      .limit(1);

    if (selectError) {
      console.error("Select error:", selectError);
      return NextResponse.json({ error: "Erro ao verificar profissionais: " + selectError.message }, { status: 500 });
    }

    if (profissionais && profissionais.length > 0) {
      return NextResponse.json({ success: true, message: "Dados já existem", profissionais: profissionais.length });
    }

    const { data: prof, error: profError } = await supabase
      .from("profissionais")
      .insert({ salao_id: user.id, nome: "Barbeiro", ativo: true })
      .select("id")
      .single();

    if (profError) {
      console.error("Prof insert error:", profError);
      return NextResponse.json({ error: "Erro ao criar profissional: " + profError.message }, { status: 500 });
    }

    const diasSemana = [
      { dia: "segunda-feira", inicio: "09:00", fim: "19:00", aberto: true },
      { dia: "terça-feira", inicio: "09:00", fim: "19:00", aberto: true },
      { dia: "quarta-feira", inicio: "09:00", fim: "19:00", aberto: true },
      { dia: "quinta-feira", inicio: "09:00", fim: "19:00", aberto: true },
      { dia: "sexta-feira", inicio: "09:00", fim: "19:00", aberto: true },
      { dia: "sábado", inicio: "09:00", fim: "14:00", aberto: true },
      { dia: "domingo", inicio: "09:00", fim: "19:00", aberto: false },
    ];

    const horariosInsert = diasSemana.map(d => ({
      profissional_id: prof.id,
      dia_semana: d.dia,
      aberto: d.aberto,
      inicio: d.inicio,
      fim: d.fim,
    }));

    const { error: horariosError } = await supabase.from("profissional_horarios").insert(horariosInsert);

    if (horariosError) {
      console.error("Horarios error:", horariosError);
    }

    const { error: servicosError } = await supabase.from("servicos").insert([
      { salao_id: user.id, nome: "Corte", duracao_min: 30, preco: 45.00 },
      { salao_id: user.id, nome: "Barba", duracao_min: 20, preco: 30.00 },
      { salao_id: user.id, nome: "Corte + Barba", duracao_min: 45, preco: 65.00 },
    ]);

    if (servicosError) {
      console.error("Servicos error:", servicosError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Dados inicializados com sucesso!",
      profissional: prof.id 
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: "Erro interno: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
