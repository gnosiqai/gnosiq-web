import { describe, it, expect } from 'vitest'
import { DELIVERY_MINUTES, REPORT_PAGES } from './metrics'

describe('metrics (fonte canônica)', () => {
  it('exposes the canonical counter values', () => {
    expect(DELIVERY_MINUTES).toBe(30)
    expect(REPORT_PAGES).toBe(18)
  })
})
