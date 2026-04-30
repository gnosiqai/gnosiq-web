import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import PostHogProvider from "@/components/PostHogProvider";
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

export const metadata: Metadata = {
  title: "GnosIQ — The Cognitive Capital API",
  description:
    "A primeira API que transforma potencial humano em capital computável. Relatório cognitivo completo em 30 minutos, por R$97.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://gnosiq.ai"
  ),
  openGraph: {
    title: "GnosIQ — The Cognitive Capital API",
    description:
      "A primeira API que transforma potencial humano em capital computável. Relatório cognitivo completo em 30 minutos, por R$97.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://gnosiq.ai",
    siteName: "GnosIQ",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GnosIQ — The Cognitive Capital API",
    description:
      "A primeira API que transforma potencial humano em capital computável. Relatório cognitivo completo em 30 minutos, por R$97.",
    creator: "@gnosiqai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {posthogKey && (
          <Script
            id="posthog-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                posthog.init('${posthogKey}', {api_host: '${posthogHost}'});
              `,
            }}
          />
        )}
      </head>
      <body className="bg-background-primary text-text-primary font-sans antialiased">
        <LocaleProvider>
          <PostHogProvider>{children}</PostHogProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
