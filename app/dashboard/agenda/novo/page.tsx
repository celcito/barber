import { getServicosAdmin, getProfissionaisAdmin } from "@/lib/actions/agendamentos";
import { AdminBookingForm } from "@/components/features/admin-booking-form";

export const dynamic = "force-dynamic";

export default async function NovoAgendamentoPage() {
  const [servicos, profissionais] = await Promise.all([
    getServicosAdmin(),
    getProfissionaisAdmin(),
  ]);

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <header className="mb-stack-lg">
          <h1 className="font-headline-md text-headline-md text-on-surface">Novo Agendamento</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Agende um horário para o cliente
          </p>
        </header>

        <div className="max-w-2xl">
          <AdminBookingForm servicos={servicos} profissionais={profissionais} />
        </div>
      </div>
    </div>
  );
}
