/**
 * @file lib/constants/company.ts
 * @description Fonte única de verdade para a identidade legal da GnosIQ.
 * REGRA DRY: rodapé, schema JSON-LD e páginas legais (Termos e Política)
 * leem daqui — nunca repetir razão social, CNPJ ou endereço literal em
 * componente ou página.
 *
 * o item 7 do DELTA DE EXECUÇÃO e o mockup do Claude Design trazem
 * o CNPJ como `66.473.782/0001-13`. O valor abaixo (`...762...`) foi
 * confirmado pelo founder em 2026-08-24 como o correto: as duas fontes de
 * design transcreveram um dígito errado. A hierarquia issue+delta > mockup
 * não cobre este caso porque a terceira fonte — o código em produção — está
 * fora dela. Não "corrigir" para 782 sem nova confirmação do founder.
 */

export const COMPANY_LEGAL_NAME = 'GNOSIQ TECNOLOGIA LTDA'
export const COMPANY_CNPJ = '66.473.762/0001-13'

/**
 * Sede fiscal, grafia verbatim do cartão CNPJ (fonte única). Escritório
 * virtual da contabilidade, por decisão do founder: não "corrigir" para
 * nenhum outro endereço. CEP com ponto porque é assim que consta no cartão;
 * `postalCode` do schema.org é texto livre.
 */
export const COMPANY_ADDRESS = {
  street: 'Av. Cristóvão Colombo',
  number: '2144',
  complement: 'Sala 408, Andar 3',
  district: 'Floresta',
  city: 'Porto Alegre',
  region: 'RS',
  postalCode: '90.560-001',
  country: 'BR',
} as const

/** Linha 1 do endereço: logradouro, número, complemento e bairro. */
export const COMPANY_ADDRESS_LINE1 =
  `${COMPANY_ADDRESS.street}, ${COMPANY_ADDRESS.number}, ${COMPANY_ADDRESS.complement}, ${COMPANY_ADDRESS.district}`
/** Linha 2 do endereço: cidade/UF, CEP e país, em PT e EN. */
export const COMPANY_ADDRESS_LINE2_PT =
  `${COMPANY_ADDRESS.city}/${COMPANY_ADDRESS.region}, CEP ${COMPANY_ADDRESS.postalCode} - Brasil`
export const COMPANY_ADDRESS_LINE2_EN =
  `${COMPANY_ADDRESS.city}/${COMPANY_ADDRESS.region}, CEP ${COMPANY_ADDRESS.postalCode} - Brazil`

/** Endereço em uma linha — rodapé e páginas legais leem daqui. */
export const COMPANY_ADDRESS_PT = `${COMPANY_ADDRESS_LINE1}, ${COMPANY_ADDRESS_LINE2_PT}`
export const COMPANY_ADDRESS_EN = `${COMPANY_ADDRESS_LINE1}, ${COMPANY_ADDRESS_LINE2_EN}`

export const COMPANY_EMAIL = 'hello@gnosiq.ai'
export const COMPANY_URL = 'https://gnosiq.ai'

/** Perfis oficiais — alimentam `sameAs` do schema Organization. */
export const COMPANY_SOCIAL = [
  'https://x.com/gnosiqai',
  'https://github.com/gnosiqai',
  'https://instagram.com/gnosiq.ai',
  'https://linkedin.com/company/gnosiq',
] as const

/** Marcas depositadas no INPI — sinal de seriedade no rodapé (issue ). */
export const TRADEMARK_NOTICE_PT =
  'GnosIQ™ e GnoScore™ são marcas depositadas no INPI.'
