/**
 * @file lib/constants/company.ts
 * @description Fonte única de verdade para a identidade legal da GnosIQ.
 * REGRA DRY: rodapé, schema JSON-LD e páginas legais leem daqui — nunca
 * repetir CNPJ ou endereço literal em componente.
 *
 * GNO-115: o item 7 do DELTA DE EXECUÇÃO e o mockup do Claude Design trazem
 * o CNPJ como `66.473.782/0001-13`. O valor abaixo (`...762...`) foi
 * confirmado pelo founder em 2026-08-24 como o correto: as duas fontes de
 * design transcreveram um dígito errado. A hierarquia issue+delta > mockup
 * não cobre este caso porque a terceira fonte — o código em produção — está
 * fora dela. Não "corrigir" para 782 sem nova confirmação do founder.
 */

export const COMPANY_LEGAL_NAME = 'GnosIQ Tecnologia Ltda.'
export const COMPANY_CNPJ = '66.473.762/0001-13'

export const COMPANY_ADDRESS_PT =
  'Rua Cristóvão Colombo, 2144, Sala 408, Floresta, Porto Alegre, RS, CEP 90560-001, Brasil'
export const COMPANY_ADDRESS_EN =
  'Rua Cristóvão Colombo, 2144, Suite 408, Porto Alegre, RS 90560-001, Brazil'

/** Componentes do endereço — usados pelo PostalAddress do schema Organization. */
export const COMPANY_ADDRESS = {
  street: 'Rua Cristóvão Colombo, 2144, Sala 408',
  district: 'Floresta',
  city: 'Porto Alegre',
  region: 'RS',
  postalCode: '90560-001',
  country: 'BR',
} as const

export const COMPANY_EMAIL = 'hello@gnosiq.ai'
export const COMPANY_URL = 'https://gnosiq.ai'

/** Perfis oficiais — alimentam `sameAs` do schema Organization. */
export const COMPANY_SOCIAL = [
  'https://x.com/gnosiqai',
  'https://github.com/gnosiqai',
  'https://instagram.com/gnosiq.ai',
  'https://linkedin.com/company/gnosiq',
] as const

/** Marcas depositadas no INPI — sinal de seriedade no rodapé (issue GNO-115). */
export const TRADEMARK_NOTICE_PT =
  'GnosIQ™ e GnoScore™ são marcas depositadas no INPI.'
