import { createClient } from "@/lib/supabase/server";
import {
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/ui/social-icons";

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

type IconComponent = (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;

type SocialLink = {
  key: string;
  href: string;
  label: string;
  icon: IconComponent;
};

function normalizeInstagram(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").replace(/^instagram\.com\//i, "");
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}

function normalizeTikTok(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").replace(/^tiktok\.com\/@?/i, "");
  if (!handle) return null;
  return `https://tiktok.com/@${handle}`;
}

function normalizeWhatsApp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("saloes")
    .select("whatsapp, config")
    .order("criado_em", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) return [];

  const config = (data.config ?? {}) as Record<string, unknown>;
  const redes = (config.redes_sociais ?? {}) as Record<string, string>;

  const links: SocialLink[] = [];

  const instagram = normalizeInstagram(redes.instagram ?? "");
  if (instagram) {
    links.push({
      key: "instagram",
      href: instagram,
      label: "Instagram",
      icon: InstagramIcon,
    });
  }

  const tiktok = normalizeTikTok(redes.tiktok ?? "");
  if (tiktok) {
    links.push({
      key: "tiktok",
      href: tiktok,
      label: "TikTok",
      icon: TikTokIcon,
    });
  }

  const whatsapp = normalizeWhatsApp(data.whatsapp);
  if (whatsapp) {
    links.push({
      key: "whatsapp",
      href: whatsapp,
      label: "WhatsApp",
      icon: WhatsAppIcon,
    });
  }

  return links;
}

export async function Footer() {
  const socialLinks = await getSocialLinks();

  return (
    <footer className="bg-surface-container-lowest w-full py-stack-lg border-t border-outline-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg mb-stack-lg">
          {/* Brand */}
          <div>
            <span className="font-display text-headline-sm text-primary uppercase tracking-widest block mb-stack-sm">
              AgendaFácil
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Agendamento premium para barbearias que valorizam a excelência.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-stack-md flex items-center gap-3">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Siga-nos
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.map(({ key, href, label, icon: Icon }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                    >
                      <Icon className="h-[18px] w-[18px] transition-transform group-hover:scale-110" />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
          <div className="flex flex-wrap justify-center gap-x-stack-md gap-y-2">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors py-2"
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
