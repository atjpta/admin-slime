import type { ItemType, ItemRarity, ItemStatus } from '@/enums/item.enum'
import type { StatKey, StatType } from '@/enums/stat.enum'
import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'

export interface RollStatConfig {
  stat: StatKey
  type: StatType
  min: number
  max: number
}

export interface RollConfig {
  slots: number
  stats: RollStatConfig[]
}

export interface ItemEquipmentMetadata {
  slot: string
  stats: { stat: StatKey; type: StatType; value: number }[]
  rollConfig?: RollConfig
}

export interface Item extends BaseResource {
  code: string
  type: ItemType
  rarity: ItemRarity
  status: ItemStatus
  stackable: boolean
  sellPrice: number
  metadata: ItemEquipmentMetadata | Record<string, unknown>
}

export interface ItemFilter extends PaginationFilter {
  type?: ItemType
  rarity?: ItemRarity
  status?: ItemStatus
}
