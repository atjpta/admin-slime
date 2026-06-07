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

export const EquipmentSlot = {
  ATTACK: 'attack',
  MAGIC: 'magic',
  SHIELD: 'shield',
  HELMET: 'helmet',
  ARMOR: 'armor',
  BOOTS: 'boots',
  GLOVE: 'glove',
  RING: 'ring',
  AMULET: 'amulet',
  EARRING: 'earring',
  BRACELET: 'bracelet',
} as const

export type EquipmentSlot = (typeof EquipmentSlot)[keyof typeof EquipmentSlot]

export const ItemSource = {
  SYSTEM: 'system',
  DROP: 'drop',
  GACHA: 'gacha',
  SHOP: 'shop',
  QUEST: 'quest',
  CRAFT: 'craft',
} as const

export type ItemSource = (typeof ItemSource)[keyof typeof ItemSource]
