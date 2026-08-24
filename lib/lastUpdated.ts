/**
 * @file lib/lastUpdated.ts
 * @description Carimbo "Atualizado em" REAL (GNO-115).
 *
 * O wireframe trazia "AGO 2026" escrito à mão. Uma data chumbada envelhece
 * em silêncio e vira mentira no rodapé — exatamente o sinal de frescor que o
 * formato AEO usa. Aqui a data é o instante do BUILD: como a LP é estática,
 * build == deploy, então o carimbo se atualiza sozinho a cada publicação.
 *
 * Só pode ser lido em server component: em client component o valor do
 * servidor e o da hidratação divergiriam.
 */

/** Instante do build. Avaliado uma vez, na geração da página. */
export const LAST_UPDATED = new Date()

/** ISO-8601 para `dateModified` do schema e para o atributo `datetime`. */
export const LAST_UPDATED_ISO = LAST_UPDATED.toISOString()

/** Rótulo humano, ex.: "AGO 2026". */
export const LAST_UPDATED_LABEL = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})
  .format(LAST_UPDATED)
  .replace('.', '')
  .replace(' de ', ' ')
  .toUpperCase()
