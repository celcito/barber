import Link from "next/link";

const hours = [
  { day: "Segunda – Sexta", time: "10:00 – 20:00" },
  { day: "Sábado", time: "09:00 – 18:00" },
  { day: "Domingo", time: "11:00 – 16:00" },
];

export function LocationSection() {
  return (
    <section id="localizacao" className="py-stack-lg md:py-[72px] bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
          {/* Map placeholder */}
          <div className="relative aspect-[4/3] lg:aspect-auto rounded overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center">
            <div className="text-center p-stack-md">
              <span className="material-symbols-outlined text-primary text-[48px] mb-stack-sm block">
                map
              </span>
              <p className="font-body-md text-on-surface-variant">
                124 Heritage Lane, Industrial District
                <br />
                Manhattan, NY 10012
              </p>
            </div>
          </div>

          {/* Hours + CTA */}
          <div className="flex flex-col justify-center">
            <p className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-stack-sm">
              Horário de Funcionamento
            </p>
            <h2 className="font-display text-headline-md text-on-surface mb-stack-md">
              Localização e Horários
            </h2>

            <div className="flex flex-col gap-stack-sm mb-stack-lg">
              {hours.map((h) => (
                <div
                  key={h.day}
                  className="flex items-center justify-between py-3 border-b border-outline-variant"
                >
                  <span className="font-body-lg text-body-lg text-on-surface">{h.day}</span>
                  <span className="font-body-lg text-body-lg text-on-surface-variant">{h.time}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="inline-block bg-primary text-on-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest rounded hover:brightness-110 active:scale-[0.98] transition-all shadow-card text-center"
            >
              Agende Seu Horário
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
