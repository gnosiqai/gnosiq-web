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

// schema Organization + Product + FAQPage (DoD: schema válido).
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

/** Caminho público do asset — o mesmo arquivo que o next/image consome. */
const FOUNDER_PHOTO_PATH = '/foto-de-perfil-linkedin.jpg'

export default function StructuredData() {
  const FOUNDER_ID = `${COMPANY_URL}/#founder`

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
    founder: { '@id': FOUNDER_ID },
  }

 /*
    O founder é um nó próprio do grafo, referenciado por @id pela Organization.
    Como Person separado ele pode ser citado por outras entidades (o autor da
    metodologia no bloco científico) sem duplicar a descrição.

    `image` aponta para o asset ORIGINAL em /public, não para a URL otimizada
    do next/image: aquela carrega query string de tamanho e qualidade e não é
    endereço estável para consumidor de schema.
 */
  const founder = {
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: 'Carlos Alberto Gomes',
    jobTitle: 'CEO & Founder',
    description: 'Autor da metodologia de avaliação cognitiva da GnosIQ.',
    image: `${COMPANY_URL}${FOUNDER_PHOTO_PATH}`,
    sameAs: ['https://www.linkedin.com/in/carlosalbertogomessp/'],
    worksFor: { '@id': `${COMPANY_URL}/#organization` },
  }

  const product = {
    '@type': 'Product',
    '@id': `${COMPANY_URL}/#product`,
    name: 'GnosIQ - Mapeamento cognitivo com GnoScore™',
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
    name: 'Como a sua mente realmente funciona? - GnosIQ',
    isPartOf: { '@id': `${COMPANY_URL}/#organization` },
 // last-updated real: mesmo instante que o rodapé exibe.
    dateModified: LAST_UPDATED_ISO,
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, founder, product, faqPage, webPage],
  }

  return (
    <script
      type="application/ld+json"
 // JSON.stringify de dados nossos, sem entrada de usuário. O escape de
 // '<' evita que uma string com "</script>" feche a tag cedo.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, String.raw`\u003c`),
      }}
    />
  )
}
