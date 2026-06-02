export const ItemType = {
  EQUIPMENT: 'equipment',
  CONSUMABLE: 'consumable',
  MATERIAL: 'material',
} as const

export type ItemType = (typeof ItemType)[keyof typeof ItemType]

export const ItemRarity = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const

export type ItemRarity = (typeof ItemRarity)[keyof typeof ItemRarity]

export const ItemStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus]
