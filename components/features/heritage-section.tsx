import Image from "next/image";

const features = [
  {
    icon: "scissors",
    title: "Mestros Artesãos",
    description:
      "Nossos barbeiros são artesãos com décadas de experiência, dedicados à perfeição em cada detalhe.",
  },
  {
    icon: "local_barber",
    title: "Salão Privado",
    description:
      "Destilados premium e espresso complimentary para uma experiência de verdadeiro luxo.",
  },
  {
    icon: "precision_manufacturing",
    title: "Ferramentas de Precisão",
    description:
      "Utilizamos aço forjado à mão e ferramentas de precisão alemã para garantir o melhor resultado.",
  },
];

export function HeritageSection() {
  return (
    <section id="heritage" className="py-stack-lg md:py-[72px] bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] rounded overflow-hidden">
            <Image
              src="/images/barber-portrait.webp"
              alt="Barbeiro mestre"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-surface-container-low/60 to-transparent" />
          </div>

          {/* Content */}
          <div>
            <p className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-stack-sm">
              O Legado da Excelência
            </p>
            <h2 className="font-display text-headline-md text-on-surface mb-stack-lg">
              A Tradição Encontra a Excelência
            </h2>

            <div className="flex flex-col gap-stack-md">
              {features.map((f) => (
                <div key={f.title} className="flex gap-stack-md items-start">
                  <span className="material-symbols-outlined text-primary text-[28px] mt-0.5 shrink-0">
                    {f.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-headline-sm text-on-surface mb-1">
                      {f.title}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
