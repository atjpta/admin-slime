export const GachaStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type GachaStatus = (typeof GachaStatus)[keyof typeof GachaStatus]

export const DrawType = {
  DRAW_1: 'draw_1',
  DRAW_10: 'draw_10',
} as const

export type DrawType = (typeof DrawType)[keyof typeof DrawType]

export const GachaRewardType = {
  EQUIPMENT: 'equipment',
} as const

export type GachaRewardType = (typeof GachaRewardType)[keyof typeof GachaRewardType]

export const CurrencyCode = {
  GOLD: 'gold',
  GEM: 'gem',
  DUST: 'dust',
} as const

export type CurrencyCode = (typeof CurrencyCode)[keyof typeof CurrencyCode]
