import Image from "next/image";

const images = [
  { src: "/images/barber-portrait.webp", alt: "Retrato do barbeiro mestre" },
  { src: "/images/barber-tools.webp", alt: "Ferramentas de barbeiro" },
  { src: "/images/hot-towel.webp", alt: "Tratamento com toalha quente" },
  { src: "/images/precision-cut.webp", alt: "Corte de precisão" },
  { src: "/images/barber-chairs.webp", alt: "Cadeiras da barbearia" },
  { src: "/images/hero-bg.webp", alt: "Interior da barbearia" },
];

export function GallerySection() {
  return (
    <section className="py-stack-lg md:py-[72px]">
      <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop">
        <p className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-stack-sm">
          O Santuário
        </p>
        <h2 className="font-display text-headline-md text-on-surface mb-stack-lg">
          Um Olhar por Dentro
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded group ${
                i === 0 ? "md:row-span-2 aspect-[3/4]" : "aspect-square"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
