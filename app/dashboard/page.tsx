import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";

interface AgendamentoHoje {
  id: string;
  cliente_nome: string;
  inicio: string;
  fim: string;
  status: string;
  servicos: { nome: string; preco: number } | null;
  profissionais: { nome: string } | null;
}

function statusVariant(status: string) {
  if (status === "confirmado") return "bg-primary/10 text-primary border border-primary/20";
  if (status === "pendente") return "bg-tertiary-container/10 text-tertiary border border-tertiary/20";
  return "bg-error/10 text-error border border-error/20";
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

  const [agendamentosResult, servicosResult, profissionaisResult] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("id, cliente_nome, inicio, fim, status, servicos(nome, preco), profissionais(nome)")
      .eq("salao_id", userId)
      .gte("inicio", hoje.toISOString())
      .lt("inicio", amanha.toISOString())
      .order("inicio"),
    supabase.from("servicos").select("id", { count: "exact" }).eq("salao_id", userId),
    supabase.from("profissionais").select("id", { count: "exact" }).eq("salao_id", userId),
  ]);

  const agendamentosHoje: AgendamentoHoje[] = (agendamentosResult.data ?? []) as unknown as AgendamentoHoje[];
  
  // Mocks for visual design
  const agendamentosMock = [
    { id: '1', horario: '09:00', duracao: '45 min', cliente: 'Arthur Shelby', servico: 'Corte Clássico & Barba Terapia' },
    { id: '2', horario: '10:15', duracao: '30 min', cliente: 'Thomas Shelby', servico: 'Hot Towel Shave' },
    { id: '3', horario: '11:00', duracao: '60 min', cliente: 'John Doe', servico: 'Grooming Ritual Completo' }
  ];

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
            <p className="font-display-lg text-display-lg text-primary">18</p>
          </div>

          <div className="bg-surface-container p-stack-md border border-outline-variant rounded group hover:border-primary/50 transition-colors">
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">Receita estimada</h3>
            <p className="font-display-lg text-display-lg text-primary">R$ 2.450</p>
          </div>

          <div className="bg-surface-container p-stack-md border border-outline-variant rounded group hover:border-primary/50 transition-colors">
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">Clientes novos</h3>
            <p className="font-display-lg text-display-lg text-primary">05</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <section className="lg:col-span-2 space-y-stack-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant pb-2">Próximos Agendamentos</h2>
            <div className="space-y-4">
              {agendamentosMock.map((ag) => (
                <div key={ag.id} className="bg-surface-container border border-outline-variant p-4 flex gap-6 hover:border-primary/30 transition-colors">
                  <div className="w-20 text-center flex flex-col justify-center border-r border-outline-variant pr-4">
                    <p className="font-headline-sm text-headline-sm text-primary">{ag.horario}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{ag.duracao}</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-headline-sm text-[20px] text-on-surface">{ag.cliente}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{ag.servico}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <aside className="lg:col-span-1 space-y-stack-lg">
            <section className="space-y-stack-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant pb-2">Equipe em Serviço</h2>
              <div className="bg-surface-container border border-outline-variant p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant relative">
                    <Image src="/images/barber-1.webp" alt="Barber" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Julian Rossi</p>
                    <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mt-1">Master Artisan</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant relative">
                    <Image src="/images/barber-2.webp" alt="Barber" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Arthur Vance</p>
                    <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mt-1">Senior Barber</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-stack-lg border-t border-outline-variant pt-stack-md text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant">&copy; 2024 The Grooming Ritual. Handcrafted Grooming.</p>
        </div>
      </div>
    </div>
  );
}
