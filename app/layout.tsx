import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/context/LocaleContext";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// VETO GATE: a descrição anterior terminava em "por R$97." e era
// reusada em `description`, `openGraph` e `twitter`. Três <meta> com preço
// numérico no HTML renderizado — o DoD exige zero. Uma constante só para as
// três, para que a próxima edição não reintroduza a divergência.
const META_DESCRIPTION =
  "A GnosIQ mapeia o seu perfil cognitivo com instrumentos validados e IA " +
  "especializada, e entrega um relatório com o seu GnoScore™ em cerca de 30 " +
  "minutos. Entre na lista de espera do beta. Não substitui avaliação clínica.";

export const metadata: Metadata = {
  title: "Como a sua mente realmente funciona? - GnosIQ",
 // indexação explícita (remoção de sinais de stealth)
  robots: { index: true, follow: true },
 // icons servidos pelas rotas geradas app/icon.tsx e app/apple-icon.tsx
 // (Next injeta os <link rel="icon"> automaticamente — não declarar aqui)
  description:
    META_DESCRIPTION,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://gnosiq.ai"
  ),
 // canonical explícito na raiz (resolvido contra metadataBase)
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Como a sua mente realmente funciona? - GnosIQ",
    description:
      META_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://gnosiq.ai",
    siteName: "GnosIQ",
    locale: "pt_BR",
    type: "website",
 // og:image vem da rota gerada app/opengraph-image.tsx —
 // Next injeta automaticamente. Não declarar `images` aqui (conflitaria).
  },
  twitter: {
    card: "summary_large_image",
    title: "Como a sua mente realmente funciona? - GnosIQ",
    description:
      META_DESCRIPTION,
    creator: "@gnosiqai",
 // twitter:image vem da rota gerada app/twitter-image.tsx
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="sitemap" href="/sitemap.xml" type="application/xml" />
      </head>
      <body className="bg-background-primary text-text-primary font-sans antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
