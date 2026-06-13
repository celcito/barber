import Link from "next/link";

const services = [
  {
    name: "O Corte Ritual",
    price: "R$45",
    description:
      "Um corte personalizado incluindo consulta, acabamento com máquina ou tesoura, e acabamento com navalha.",
  },
  {
    name: "Esculpir Barba",
    price: "R$35",
    description:
      "Modelagem completa com tratamento de toalha quente e óleos premium.",
  },
  {
    name: "Ritual Completo",
    price: "R$75",
    badge: "Signature",
    description:
      "A experiência completa: Corte assinatura, manutenção de barba, máscara de carvão, e barba tradicional com toalha quente.",
  },
];

export function ServicesSection() {
  return (
    <section id="servicos" className="py-stack-lg md:py-[72px]">
      <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop">
        <p className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-stack-sm">
          Serviços Selecionados
        </p>
        <h2 className="font-display text-headline-md text-on-surface mb-stack-lg max-w-xl">
          Precisão projetada para o indivíduo exigente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {services.map((s) => (
            <div
              key={s.name}
              className="group relative flex h-full flex-col justify-between rounded border border-outline-variant bg-surface-container p-stack-md transition-all duration-300 hover:border-primary/40 hover:bg-surface-container-high"
            >
              <div>
                {s.badge && (
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-primary font-label-sm uppercase tracking-wider">
                    {s.badge}
                  </span>
                )}
                <h3 className="font-display text-headline-sm text-on-surface mt-4 mb-3">
                  {s.name}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-8 border-t border-outline-variant pt-stack-sm flex items-center gap-4 text-sm sm:text-base">
                <span className="font-display text-headline-sm text-primary">{s.price}</span>
                <span className="dotted-leader" />
                <Link
                  href="/login"
                  className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider hover:text-primary transition-colors shrink-0"
                >
                  Agendar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
