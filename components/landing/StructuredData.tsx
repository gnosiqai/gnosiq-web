import {
  COMPANY_LEGAL_NAME,
  COMPANY_CNPJ,
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_URL,
  COMPANY_SOCIAL,
} from '@/lib/constants/company'
import { FAQ_ITEMS } from '@/lib/constants/faq'
import { LAST_UPDATED_ISO } from '@/lib/lastUpdated'
import { DELIVERY_MINUTES } from '@/lib/constants/metrics'

// GNO-115 — schema Organization + Product + FAQPage (DoD: schema válido).
//
// VETO GATE dentro do schema: o Product NÃO declara `offers`. Um
// `offers.price` seria preço numérico no HTML renderizado — a mesma violação
// que o bloco de preço, só que escondida no JSON-LD. Product sem offers é
// válido; o Rich Results Test avisa que sem `offers`/`review`/`aggregateRating`
// o snippet de produto não é elegível, e isso é aceito conscientemente: a v2
// é pré-lançamento sem preço público.
//
// O FAQPage é gerado do MESMO array que renderiza o bloco visível
// (lib/constants/faq.ts) — schema divergente do conteúdo é spam para o Google.
//
// Server component: JSON-LD estático, resolvido no build.

export default function StructuredData() {
  const organization = {
    '@type': 'Organization',
    '@id': `${COMPANY_URL}/#organization`,
    name: 'GnosIQ',
    legalName: COMPANY_LEGAL_NAME,
    url: COMPANY_URL,
    email: COMPANY_EMAIL,
    // CNPJ é o registro fiscal brasileiro — `taxID` é o campo do schema.org.
    taxID: COMPANY_CNPJ,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_ADDRESS.street,
      addressLocality: COMPANY_ADDRESS.city,
      addressRegion: COMPANY_ADDRESS.region,
      postalCode: COMPANY_ADDRESS.postalCode,
      addressCountry: COMPANY_ADDRESS.country,
    },
    sameAs: [...COMPANY_SOCIAL],
    founder: {
      '@type': 'Person',
      name: 'Carlos Alberto Gomes',
      jobTitle: 'CEO & Founder',
      sameAs: 'https://www.linkedin.com/in/carlosalbertogomessp/',
    },
  }

  const product = {
    '@type': 'Product',
    '@id': `${COMPANY_URL}/#product`,
    name: 'GnosIQ — Mapeamento cognitivo com GnoScore™',
    description:
      `Mapeamento do perfil cognitivo com instrumentos validados e IA especializada, ` +
      `com relatório e GnoScore™ entregues em cerca de ${DELIVERY_MINUTES} minutos. ` +
      `Não substitui avaliação clínica.`,
    brand: { '@type': 'Brand', name: 'GnosIQ' },
    category: 'Avaliação cognitiva',
    url: COMPANY_URL,
    // Sem `offers`: ver nota do VETO GATE no topo do arquivo.
  }

  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${COMPANY_URL}/#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const webPage = {
    '@type': 'WebPage',
    '@id': `${COMPANY_URL}/#webpage`,
    url: COMPANY_URL,
    name: 'Como a sua mente realmente funciona? — GnosIQ',
    isPartOf: { '@id': `${COMPANY_URL}/#organization` },
    // last-updated real: mesmo instante que o rodapé exibe.
    dateModified: LAST_UPDATED_ISO,
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, product, faqPage, webPage],
  }

  return (
    <script
      type="application/ld+json"
      // JSON.stringify de dados nossos, sem entrada de usuário. O escape de
      // '<' evita que uma string com "</script>" feche a tag cedo.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  )
}
