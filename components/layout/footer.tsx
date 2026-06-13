

const footerLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#heritage", label: "Barbeiros" },
  { href: "#localizacao", label: "Localização" },
];

const legalLinks = [
  { href: "#", label: "Política de Privacidade" },
  { href: "#", label: "Termos de Uso" },
  { href: "#", label: "Contato" },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-stack-lg border-t border-outline-variant">
      <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg mb-stack-lg">
          {/* Brand */}
          <div>
            <span className="font-display text-headline-sm text-primary uppercase tracking-widest block mb-stack-sm">
              AgendaFácil
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Agendamento premium para barbearias que valorizam a excelência.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-stack-sm">
              Navegação
            </h4>
            <div className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-stack-sm">
              Contato
            </h4>
            <div className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
              <span>124 Heritage Lane</span>
              <span>Manhattan, NY 10012</span>
              <span className="text-primary">(212) 555-0199</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-stack-md border-t border-outline-variant gap-stack-sm">
          <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">
            &copy; 2026 AgendaFácil. Todos os direitos reservados.
          </p>
          <div className="flex gap-stack-md">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
