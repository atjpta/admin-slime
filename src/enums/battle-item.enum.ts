export const BattleItemType = {
  BUFF: 'buff',
  INFO: 'info',
  BLUFF: 'bluff',
  TEMPO: 'tempo',
  CHAOS: 'chaos',
} as const

export type BattleItemType = (typeof BattleItemType)[keyof typeof BattleItemType]

export const BattleItemStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type BattleItemStatus = (typeof BattleItemStatus)[keyof typeof BattleItemStatus]
