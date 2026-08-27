import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { countWaitlist } from '@/lib/firestore'
import { FOUNDER_SLOTS } from '@/lib/constants/founder'

export const runtime = 'nodejs'

/*
  A amortização mora AQUI, no cache de dados, e não na borda.

  Rota deliberadamente SEM `export const revalidate`: no Next 15 um route
  handler já é dinâmico por padrão, e é isso que queremos. `revalidate` faria
  o Next tentar pré-renderizar no build, o que exige a coleção acessível
  naquele momento; quando não está, a rota cai para dinâmica e a amortização
  não acontece em lugar nenhum. Amortizar no cache de dados não depende de
  nada disso.

  `unstable_cache` resolve pelo lado certo: o que é caro é a aggregation
  query, não a invocação da função. Uma leitura serve todas as requests da
  janela de 10s. Medido com sonda: 100 requests em 26s produziram 2 leituras
  reais; sem cache seriam 100.

  Falha NÃO é cacheada — exceção não vira entrada de cache. Uma
  indisponibilidade transitória do Firestore é retentada na request seguinte,
  em vez de ficar presa por 10s.
*/
const readWaitlistCount = unstable_cache(
  async () => ({
    signups: await countWaitlist(),
 // Carimbo da LEITURA, não da resposta — é o que sai no header
 // `x-count-computed-at`. Ele fica DENTRO da função cacheada de propósito:
 // requests da mesma janela devolvem o mesmo carimbo porque compartilham a
 // mesma leitura. Sem isso não há como provar amortização em produção sem
 // instrumentar o Firestore.
    computedAt: new Date().toISOString(),
  }),
  ['waitlist-count'],
  { revalidate: 10 },
)

/**
 * Placar público de vagas restantes.
 *
 * FONTE: `count(waitlist)` — o total de inscritos, lido na hora. A condição
 * de entrada é determinada pelo `createdAt` que o servidor grava no instante
 * da inscrição, então o total de inscritos JÁ É o total de condições
 * determinadas. Contar aqui é reportar a realidade da coleção, não antecipar
 * nada: o placar deixa de depender de um processo em lote para dizer a
 * verdade.
 *
 * Custo: uma aggregation query por request. Não cresce com a coleção e nenhum
 * documento trafega para o processo.
 *
 * Falha é 503 com `available: false`, NUNCA um número de fallback. Um número
 * inventado aqui vira promessa pública quebrada — o componente sabe renderizar
 * a versão sem número.
 */
export async function GET() {
  try {
    const { signups, computedAt } = await readWaitlistCount()

 // Clamp: passando de 100, a página mostra 0 vagas — nunca um negativo.
    const slotsRemaining = Math.max(0, FOUNDER_SLOTS - signups)

    return NextResponse.json(
      { available: true, signups, slotsRemaining, total: FOUNDER_SLOTS },
      {
        status: 200,
        headers: {
 // `max-age=0` obriga o navegador a revalidar: sem isso um F5 comum
 // continua mostrando o número anterior por até um minuto.
 // `s-maxage=10` deixa a borda absorver rajada sem esconder a fonte.
          'Cache-Control': 'public, max-age=0, s-maxage=10',
 // Mesmo carimbo em requests próximas = uma leitura servindo todas. Não vai
 // no corpo: o contrato da resposta é contrato público e fica intocado.
          'x-count-computed-at': computedAt,
        },
      },
    )
  } catch (err) {
 // Log interno detalhado — a resposta não expõe nada da credencial.
    console.error('[waitlist-count] Erro ao contar inscritos:', err)

 // `no-store` explícito, e NUNCA o `s-maxage` do caminho de sucesso: uma
 // falha transitória do Firestore não pode ser fixada na borda. Sem header
 // nenhum aqui a decisão fica com a heurística do CDN, e o pior caso é a
 // página anunciar indisponibilidade por até 10s depois de a fonte ter
 // voltado.
    return NextResponse.json(
      { available: false },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
