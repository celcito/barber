import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";

interface AgendamentoHoje {
  id: string;
  cliente_nome: string;
  inicio: string;
  fim: string;
  status: string;
  servicos: { nome: string; preco: number; duracao_min: number } | null;
  profissionais: { nome: string } | null;
}

interface Profissional {
  id: string;
  nome: string;
  foto_url: string | null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId: string = user?.id as string;
  if (!userId) redirect("/login");

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

  const [agendamentosResult, profissionaisResult, clientesNovosResult] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("id, cliente_nome, inicio, fim, status, servicos(nome, preco, duracao_min), profissionais(nome)")
      .eq("salao_id", userId)
      .gte("inicio", hoje.toISOString())
      .lt("inicio", amanha.toISOString())
      .order("inicio"),
    supabase.from("profissionais").select("id, nome, foto_url").eq("salao_id", userId),
    supabase
      .from("agendamentos")
      .select("cliente_nome")
      .eq("salao_id", userId)
      .gte("criado_em", inicioMes.toISOString())
      .lt("criado_em", fimMes.toISOString()),
  ]);

  const agendamentosHoje: AgendamentoHoje[] = (agendamentosResult.data ?? []) as unknown as AgendamentoHoje[];
  const profissionais: Profissional[] = (profissionaisResult.data ?? []) as Profissional[];
  const clientesNovos = new Set((clientesNovosResult.data ?? []).map((c: { cliente_nome: string }) => c.cliente_nome)).size;

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop bg-background min-h-screen">
      <div className="max-w-container-max mx-auto">
        <header className="mb-stack-lg">
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Visão Geral</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Gestão do dia {hoje.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
          <div className="bg-surface-container p-stack-md border border-outline-variant rounded group hover:border-primary/50 transition-colors">
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">Agendamentos hoje</h3>
            <p className="font-display-lg text-display-lg text-primary">{agendamentosHoje.length}</p>
          </div>

          <div className="bg-surface-container p-stack-md border border-outline-variant rounded group hover:border-primary/50 transition-colors">
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">Receita estimada</h3>
            <p className="font-display-lg text-display-lg text-primary">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                agendamentosHoje.reduce((acc, a) => acc + (a.servicos?.preco ?? 0), 0)
              )}
            </p>
          </div>

          <div className="bg-surface-container p-stack-md border border-outline-variant rounded group hover:border-primary/50 transition-colors">
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">Clientes novos</h3>
            <p className="font-display-lg text-display-lg text-primary">{String(clientesNovos).padStart(2, "0")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <section className="lg:col-span-2 space-y-stack-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant pb-2">Próximos Agendamentos</h2>
            <div className="space-y-4">
              {agendamentosHoje.length > 0 ? agendamentosHoje.map((ag) => (
                <div key={ag.id} className="bg-surface-container border border-outline-variant p-4 flex gap-6 hover:border-primary/30 transition-colors">
                  <div className="w-20 text-center flex flex-col justify-center border-r border-outline-variant pr-4">
                    <p className="font-headline-sm text-headline-sm text-primary">{formatTime(ag.inicio)}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{ag.servicos?.duracao_min ?? '-'} min</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-headline-sm text-[20px] text-on-surface">{ag.cliente_nome}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{ag.servicos?.nome ?? 'Serviço não informado'}</p>
                  </div>
                </div>
              )) : (
                <div className="bg-surface-container border border-outline-variant p-8 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">Nenhum agendamento para hoje</p>
                </div>
              )}
            </div>
          </section>
          
          <aside className="lg:col-span-1 space-y-stack-lg">
            <section className="space-y-stack-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant pb-2">Equipe em Serviço</h2>
              <div className="bg-surface-container border border-outline-variant p-4 space-y-4">
                {profissionais.length > 0 ? profissionais.map((prof) => (
                  <div key={prof.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant relative shrink-0">
                      {prof.foto_url ? (
                        <Image src={prof.foto_url} alt={prof.nome} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="font-label-md text-label-md text-primary">
                            {prof.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{prof.nome}</p>
                      <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mt-1">Em serviço</p>
                    </div>
                  </div>
                )) : (
                  <p className="font-body-md text-body-md text-on-surface-variant">Nenhum profissional cadastrado</p>
                )}
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-stack-lg border-t border-outline-variant pt-stack-md text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant">&copy; 2024 AgendaFácil. Cuidado Artesanal.</p>
        </div>
      </div>
    </div>
  );
}
