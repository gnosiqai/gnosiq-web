import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import Home from '@/app/page'
import { FAQ_ITEMS } from '@/lib/constants/faq'
import { COMPANY_CNPJ } from '@/lib/constants/company'

/**
 * travas do DoD.
 *
 * Estes testes não checam estética: eles seguram as duas proibições que têm
 * custo real se vazarem para produção (CFP e VETO GATE) e a validade do
 * schema. São propositalmente rodados sobre a PÁGINA INTEIRA renderizada, e
 * não seção a seção: a violação da v1 morava no <meta> do layout e em um
 * componente órfão — lugares que um teste por seção não alcança.
 */

const html = renderToStaticMarkup(<Home />)

describe('DoD · CFP — a palavra "diagnóstico" não existe na LP', () => {
  it('nenhuma flexão de diagnóstic* no HTML renderizado', () => {
    const matches = html.match(/diagn[oó]stic\w*/gi) ?? []
    expect(matches).toEqual([])
  })

  it('o H2 do bloco-problema usa "mapeamento", a correção da issue', () => {
    expect(html).toContain('Por que o mapeamento cognitivo profundo era inacessível?')
  })
})

describe('DoD · VETO GATE — nenhum preço numérico na LP', () => {
  it('não há cifra seguida de dígito', () => {
 // Pega R$97, R$ 97, $97, US$ 97. "R$ milhares" passa: não tem dígito.
    const matches = html.match(/(?:R\$|US\$|\$)\s*\d/g) ?? []
    expect(matches).toEqual([])
  })

  it('não há valor escrito por extenso em reais', () => {
    expect(html).not.toMatch(/\d+\s*reais/i)
  })

  it('a condição de fundador é qualitativa, não um número', () => {
    expect(html).toContain('Preço de fundador travado')
    expect(html).toContain('Fração do custo')
  })
})

describe('DoD · estrutura AEO', () => {
  it('o H1 é a pergunta do comprador', () => {
    expect(html).toMatch(/<h1[^>]*>[\s\S]*Como a sua mente[\s\S]*realmente[\s\S]*funciona\?[\s\S]*<\/h1>/)
  })

  it('há exatamente um H1', () => {
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1)
  })

  it('os H2 principais são perguntas', () => {
    for (const question of [
      'O que eu recebo exatamente?',
      'Por que o mapeamento cognitivo profundo era inacessível?',
      'Isso tem base científica?',
    ]) {
      expect(html).toContain(question)
    }
  })

  it('o CTA da waitlist e o formulário estão presentes', () => {
    expect(html).toContain('Entrar na lista de espera')
    expect(html).toContain('id="waitlist"')
  })

  it('o disclaimer clínico aparece no hero e no bloco de prova', () => {
    const occurrences = html.match(/não substitui avaliação clínica/g) ?? []
    expect(occurrences.length).toBeGreaterThanOrEqual(2)
  })
})

describe('DoD · schema JSON-LD', () => {
  const extractGraph = () => {
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    )
    expect(match).not.toBeNull()
 // O componente escapa '<' como < para não fechar a tag cedo.
    return JSON.parse(match![1].replace(/\\u003c/g, '<'))
  }

  it('é JSON válido com os três tipos exigidos', () => {
    const graph = extractGraph()
    const types = graph['@graph'].map((node: { '@type': string }) => node['@type'])
    expect(types).toContain('Organization')
    expect(types).toContain('WebSite')
    expect(types).toContain('FAQPage')
  })

 /*
    O Product exige `offers`/`review`/`aggregateRating` e os três estão vetados (preço público é decisão GATE; avaliação de produto
    pré-lançamento seria fabricada). Sem nenhum deles o nó é erro no Search
    Console, não só inelegível. Enquanto o veto valer, Product não volta —
    nem "só a descrição", que é como ele entrou da primeira vez.
 */
  it('NENHUM nó Product no grafo enquanto offers estiver vetado', () => {
    const graph = extractGraph()
    const types = graph['@graph'].map((node: { '@type': string }) => node['@type'])
    expect(types).not.toContain('Product')
    expect(types).not.toContain('SoftwareApplication')
  })

  it('a WebPage é parte do WebSite, e o WebSite é publicado pela Organization', () => {
    const graph = extractGraph()
    const byType = (type: string) =>
      graph['@graph'].find((node: { '@type': string }) => node['@type'] === type)

    const website = byType('WebSite')
    const webPage = byType('WebPage')

 // Referência pendurada em @id inexistente é grafo quebrado para o Google.
    expect(webPage.isPartOf['@id']).toBe(website['@id'])
    expect(website.publisher['@id']).toBe(byType('Organization')['@id'])
  })

  it('o FAQPage bate 1:1 com o FAQ visível — schema divergente é spam', () => {
    const graph = extractGraph()
    const faq = graph['@graph'].find(
      (node: { '@type': string }) => node['@type'] === 'FAQPage',
    )

    expect(faq.mainEntity).toHaveLength(FAQ_ITEMS.length)

    FAQ_ITEMS.forEach((item, index) => {
      expect(faq.mainEntity[index].name).toBe(item.question)
      expect(faq.mainEntity[index].acceptedAnswer.text).toBe(item.answer)
 // E a mesma pergunta tem que estar no HTML visível, não só no schema.
      expect(html).toContain(item.question)
    })
  })

  it('o carimbo de atualização é real e casa com o rodapé', () => {
    const graph = extractGraph()
    const webPage = graph['@graph'].find(
      (node: { '@type': string }) => node['@type'] === 'WebPage',
    )
    expect(webPage.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}T/)
 // renderToStaticMarkup emite `dateTime`; o browser/Next emitem `datetime`.
 // Atributo HTML é case-insensitive, então a asserção também é.
    expect(html).toMatch(
      new RegExp(`datetime="${webPage.dateModified}"`, 'i'),
    )
  })
})

describe('DoD · rodapé legal preservado', () => {
  it('CNPJ, endereço, e-mail e links legais estão no rodapé', () => {
    expect(html).toContain(COMPANY_CNPJ)
    expect(html).toContain('Rua Cristóvão Colombo, 2144')
    expect(html).toContain('hello@gnosiq.ai')
    expect(html).toContain('Política de Privacidade')
    expect(html).toContain('Termos de Uso')
  })

  it('o CNPJ não regrediu para o dígito errado do mockup', () => {
    expect(html).not.toContain('66.473.782')
  })
})

describe('DoD · cortes confirmados do wireframe', () => {
  it('nenhum concorrente é nomeado na comparação', () => {
    for (const brand of ['Hogan', 'Crystal', 'BetterUp']) {
      expect(html).not.toContain(brand)
    }
  })

  it('a escassez nunca vira número inventado antes da resposta do endpoint', () => {
 // No SSR o contador ainda não buscou: a frase tem que ser a sem número.
    expect(html).toContain('Vagas de fundador limitadas aos')
    expect(html).not.toContain('vagas de fundador restantes')
  })
})
