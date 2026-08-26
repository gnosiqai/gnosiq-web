import { describe, it, expect } from 'vitest'
import { FILL_MINUTES, DELIVERY_MINUTES, REPORT_PAGES } from './metrics'

describe('metrics (fonte canônica)', () => {
  it('exposes the canonical counter values', () => {
    expect(FILL_MINUTES).toBe(22)
    expect(DELIVERY_MINUTES).toBe(30)
    expect(REPORT_PAGES).toBe(18)
  })
})
