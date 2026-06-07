export const StatKey = {
  ATTACK: 'attack',
  MAGIC: 'magic',
  DEFENSE: 'defense',
  HP: 'hp',
} as const

export type StatKey = (typeof StatKey)[keyof typeof StatKey]

export const StatType = {
  FLAT: 'flat',
  PERCENT: 'percent',
} as const

export type StatType = (typeof StatType)[keyof typeof StatType]

export const StatSource = {
  BASE: 'base',
  EQUIPMENT: 'equipment',
} as const

export type StatSource = (typeof StatSource)[keyof typeof StatSource]
