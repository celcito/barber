import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk } from "next/font/google";
import MaterialSymbolsFont from "@/components/material-symbols-font";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agendafacil.com.br"),
  title: {
    default: "AgendaFácil",
    template: "%s — AgendaFácil",
  },
  description: "Agendamento premium para salões e barbearias",
  openGraph: {
    title: "AgendaFácil",
    description: "Agendamento premium para salões e barbearias",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark noise-overlay">
      <head>
        <MaterialSymbolsFont />
      </head>
      <body className={`${playfair.variable} ${hanken.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
