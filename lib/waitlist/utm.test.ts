import { describe, it, expect } from 'vitest'
import { parseUtm } from './utm'

// o DoD exige medir conversão v1 vs v2. Sem UTM no evento, o
// PostHog registra a conversão sem a origem e a comparação vira palpite.

describe('parseUtm', () => {
  it('extrai os cinco parâmetros', () => {
    expect(
      parseUtm(
        '?utm_source=linkedin&utm_medium=social&utm_campaign=inpi&utm_term=cognitivo&utm_content=post1',
      ),
    ).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'inpi',
      utm_term: 'cognitivo',
      utm_content: 'post1',
    })
  })

  it('omite chaves ausentes em vez de mandar null — não polui o schema do evento', () => {
    expect(parseUtm('?utm_source=linkedin')).toEqual({ utm_source: 'linkedin' })
  })

  it('ignora parâmetros que não são UTM', () => {
    expect(parseUtm('?ref=x&gclid=y&utm_source=linkedin')).toEqual({
      utm_source: 'linkedin',
    })
  })

  it('devolve objeto vazio sem query string', () => {
    expect(parseUtm('')).toEqual({})
  })

  it('descarta valor vazio', () => {
    expect(parseUtm('?utm_source=')).toEqual({})
  })

  it('decodifica valor com escape', () => {
    expect(parseUtm('?utm_campaign=lan%C3%A7amento')).toEqual({
      utm_campaign: 'lançamento',
    })
  })
})

describe('getUtmParams — leitura da URL atual', () => {
  it('lê a query string do browser', async () => {
    const { getUtmParams } = await import('./utm')
    window.history.replaceState({}, '', '/?utm_source=x&utm_campaign=y')
    expect(getUtmParams()).toEqual({ utm_source: 'x', utm_campaign: 'y' })
  })

  it('devolve vazio quando não há UTM', async () => {
    const { getUtmParams } = await import('./utm')
    window.history.replaceState({}, '', '/')
    expect(getUtmParams()).toEqual({})
  })
})
